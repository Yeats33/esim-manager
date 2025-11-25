const fs = require('node:fs')
const path = require('node:path')

// 通过 window 对象向渲染进程注入 nodejs 能力
window.services = {
  // 读文件
  readFile (file) {
    return fs.readFileSync(file, { encoding: 'utf-8' })
  },
  // 文本写入到下载目录
  writeTextFile (text) {
    const filePath = path.join(window.utools.getPath('downloads'), Date.now().toString() + '.txt')
    fs.writeFileSync(filePath, text, { encoding: 'utf-8' })
    return filePath
  },
  // 图片写入到下载目录
  writeImageFile (base64Url) {
    const matchs = /^data:image\/([a-z]{1,20});base64,/i.exec(base64Url)
    if (!matchs) return
    const filePath = path.join(window.utools.getPath('downloads'), Date.now().toString() + '.' + matchs[1])
    fs.writeFileSync(filePath, base64Url.substring(matchs[0].length), { encoding: 'base64' })
    return filePath
  },

  // --- eSIM 本地存储管理（简单模拟） ---
  _getEsimStorePath () {
    return path.join(window.utools.getPath('downloads'), 'esim_profiles.json')
  },
  _ensureEsimStore () {
    const file = this._getEsimStorePath()
    if (!fs.existsSync(file)) {
      // create a single preset 'none' group (device -> card -> eid) so all 'none' references point here
      const noneEid = { id: '__none_eid__', eid: 'none', nickname: 'none', profiles: [] }
      const noneCard = { id: '__none_card__', cardType: 'none', cardName: '未指定卡片', eids: [noneEid] }
      const noneDevice = { id: '__none__', name: '未指定设备', cards: [noneCard] }
      const initial = { devices: [noneDevice], profiles: [] }
      fs.writeFileSync(file, JSON.stringify(initial, null, 2), { encoding: 'utf-8' })
    }
    return file
  },

  // Return full store object, with migration from old array format
  _getStore () {
    try {
      const file = this._ensureEsimStore()
      const content = fs.readFileSync(file, { encoding: 'utf-8' })
      let parsed = null
      try {
        parsed = JSON.parse(content || 'null')
      } catch (e) {
        parsed = null
      }
      // If existing data is an array (old format), migrate
      if (Array.isArray(parsed)) {
        const store = { devices: [], profiles: parsed }
        fs.writeFileSync(file, JSON.stringify(store, null, 2), { encoding: 'utf-8' })
        return store
      }
      if (!parsed || typeof parsed !== 'object') {
        const store = { devices: [], profiles: [] }
        fs.writeFileSync(file, JSON.stringify(store, null, 2), { encoding: 'utf-8' })
        return store
      }
      // ensure shape and presence of a single 'none' group
      parsed.devices = Array.isArray(parsed.devices) ? parsed.devices : []
      parsed.profiles = Array.isArray(parsed.profiles) ? parsed.profiles : []
      // ensure none device/card/eid exist
      if (!parsed.devices.find(d => d.id === '__none__')) {
        const noneEid = { id: '__none_eid__', eid: 'none', nickname: 'none', profiles: [] }
        const noneCard = { id: '__none_card__', cardType: 'none', cardName: '未指定卡片', eids: [noneEid] }
        const noneDevice = { id: '__none__', name: '未指定设备', cards: [noneCard] }
        parsed.devices.unshift(noneDevice)
      } else {
        // ensure none card/eid inside existing none device
        const nd = parsed.devices.find(d => d.id === '__none__')
        if (!nd.cards || !nd.cards.find(c => c.id === '__none_card__')) {
          const noneEid = { id: '__none_eid__', eid: 'none', nickname: 'none', profiles: [] }
          const noneCard = { id: '__none_card__', cardType: 'none', cardName: '未指定卡片', eids: [noneEid] }
          nd.cards = nd.cards || []
          nd.cards.unshift(noneCard)
        } else {
          const nc = nd.cards.find(c => c.id === '__none_card__')
          if (!nc.eids || !nc.eids.find(e => e.id === '__none_eid__')) {
            nc.eids = nc.eids || []
            nc.eids.unshift({ id: '__none_eid__', eid: 'none', nickname: 'none', profiles: [] })
          }
        }
      }
      // ensure every device (except global none) has its own "none" card/eid
      for (const dev of parsed.devices) {
        if (!dev.cards) dev.cards = []
        if (dev.id === '__none__') continue
        let noneCard = dev.cards.find(c => c.id === `__none_card__${dev.id}`) || dev.cards.find(c => c.id === '__none_card__')
        if (!noneCard) {
          noneCard = { id: `__none_card__${dev.id}`, cardType: 'none', cardName: '未指定卡片', eids: [] }
          dev.cards.unshift(noneCard)
        }
        let noneEid = (noneCard.eids || []).find(e => e.id === `__none_eid__${dev.id}`) || (noneCard.eids || []).find(e => e.id === '__none_eid__')
        if (!noneEid) {
          noneEid = { id: `__none_eid__${dev.id}`, eid: 'none', nickname: 'none', profiles: [] }
          noneCard.eids = noneCard.eids || []
          noneCard.eids.unshift(noneEid)
        }
      }
      return parsed
    } catch (err) {
      return { devices: [], profiles: [] }
    }
  },

  _saveStore (store) {
    const file = this._getEsimStorePath()
    fs.writeFileSync(file, JSON.stringify(store, null, 2), { encoding: 'utf-8' })
    return file
  },

  _ensureDeviceNoneCard (device) {
    if (!device) return null
    device.cards = device.cards || []
    if (device.id === '__none__') {
      let card = device.cards.find(c => c.id === '__none_card__')
      if (!card) {
        const noneEid = { id: '__none_eid__', eid: 'none', nickname: 'none', profiles: [] }
        card = { id: '__none_card__', cardType: 'none', cardName: '未指定卡片', eids: [noneEid] }
        device.cards.unshift(card)
      }
      if (!card.eids || !card.eids.find(e => e.id === '__none_eid__')) {
        card.eids = card.eids || []
        card.eids.unshift({ id: '__none_eid__', eid: 'none', nickname: 'none', profiles: [] })
      }
      return card
    }
    let card = device.cards.find(c => c.id === `__none_card__${device.id}`) || device.cards.find(c => c.id === '__none_card__')
    if (!card) {
      const noneEid = { id: `__none_eid__${device.id}`, eid: 'none', nickname: 'none', profiles: [] }
      card = { id: `__none_card__${device.id}`, cardType: 'none', cardName: '未指定卡片', eids: [noneEid] }
      device.cards.unshift(card)
    }
    if (!card.eids || !card.eids.find(e => e.id === `__none_eid__${device.id}`)) {
      card.eids = card.eids || []
      card.eids.unshift({ id: `__none_eid__${device.id}`, eid: 'none', nickname: 'none', profiles: [] })
    }
    return card
  },

  // Devices / Cards / EIDs APIs
  getDevices () {
    const store = this._getStore()
    return store.devices
  },

  addDevice (device) {
    const store = this._getStore()
    const newDevice = Object.assign({ id: Date.now().toString(), name: device.name || 'Unnamed Device', cards: [] }, device)
    this._ensureDeviceNoneCard(newDevice)
    store.devices.push(newDevice)
    this._saveStore(store)
    return newDevice
  },

  addCard (deviceId, card) {
    const store = this._getStore()
    let device = store.devices.find(d => d.id === deviceId)
    // if no deviceId passed or device not found, use or create a special unassigned device
    if (!device) {
      device = store.devices.find(d => d.id === '__none__')
      if (!device) {
        // ensure none device exists via _getStore, but fallback to creating
        device = { id: '__none__', name: 'none', cards: [] }
        store.devices.push(device)
      }
    }
    const newCard = Object.assign({ id: Date.now().toString() + Math.random().toString(36).slice(2), cardType: card.cardType || 'native', cardName: card.cardName || 'Unnamed Card', eids: [] }, card)
    device.cards.push(newCard)
    this._saveStore(store)
    return newCard
  },

  addEid (deviceId, cardId, eidValue, nickname) {
    const store = this._getStore()
    // allow missing deviceId/cardId => place into the '__none__' group
    let device = store.devices.find(d => d.id === deviceId)
    if (!device) {
      device = store.devices.find(d => d.id === '__none__')
      if (!device) throw new Error('device not found')
    }
    let card = null
    if (cardId) card = device.cards.find(c => c.id === cardId)
    if (!card) {
      // fallback: use device-specific none card, otherwise global none card
      card = this._ensureDeviceNoneCard(device)
      if (!card) {
        const nd = store.devices.find(d => d.id === '__none__')
        card = this._ensureDeviceNoneCard(nd)
      }
    }
    if (!card) throw new Error('card not found')
    // enforce constraints
    const type = card.cardType
    const existingEids = card.eids || []
    if (type === 'native' && existingEids.length >= 1) throw new Error('native 卡只能绑定 1 个 EID')
    if (type === 'psim' && existingEids.length >= 1) throw new Error('psim 卡只能有 1 个 EID 且 1 个 profile')
    if (type === 'physical' && existingEids.length >= 2) throw new Error('实体卡最多绑定 2 个 EID')
    const newEid = { id: Date.now().toString() + Math.random().toString(36).slice(2), eid: eidValue, nickname: nickname || '', profiles: [] }
    card.eids.push(newEid)
    this._saveStore(store)
    return newEid
  },

  updateDevice (deviceId, data) {
    const store = this._getStore()
    if (!deviceId || deviceId === '__none__') return false
    const dev = store.devices.find(d => d.id === deviceId)
    if (!dev) return false
    if (data && data.name) dev.name = data.name
    this._saveStore(store)
    return true
  },

  updateCard (cardId, data) {
    const store = this._getStore()
    if (!cardId || cardId === '__none_card__') return false
    for (const d of store.devices) {
      const card = (d.cards || []).find(c => c.id === cardId)
      if (card) {
        if (data && data.cardName) card.cardName = data.cardName
        if (data && data.cardType) card.cardType = data.cardType
        this._saveStore(store)
        return true
      }
    }
    return false
  },

  updateEid (eidId, data) {
    const store = this._getStore()
    if (!eidId || eidId === '__none_eid__') return false
    for (const d of store.devices) {
      for (const c of d.cards || []) {
        const eid = (c.eids || []).find(e => e.id === eidId)
        if (eid) {
          if (data && data.eid) eid.eid = data.eid
          if (data && data.nickname !== undefined) eid.nickname = data.nickname
          this._saveStore(store)
          return true
        }
      }
    }
    return false
  },

  // Move a card (by cardId) to another device (targetDeviceId). If targetDeviceId falsy, move to unassigned device.
  moveCard (cardId, targetDeviceId) {
    const store = this._getStore()
    let found = null
    let parentDevice = null
    for (const d of store.devices) {
      const idx = (d.cards || []).findIndex(c => c.id === cardId)
      if (idx !== -1) {
        found = d.cards.splice(idx, 1)[0]
        parentDevice = d
        break
      }
    }
    if (!found) return null
    let target = store.devices.find(d => d.id === targetDeviceId)
    if (!target) {
      target = store.devices.find(d => d.id === '__none__')
      if (!target) {
        target = { id: '__none__', name: 'none', cards: [] }
        store.devices.push(target)
      }
    }
    target.cards.push(found)
    this._saveStore(store)
    return { moved: true, from: parentDevice ? parentDevice.id : null, to: target.id }
  },

  // Move an EID to another card
  moveEid (eidId, targetCardId) {
    const store = this._getStore()
    let foundEid = null
    let fromCard = null
    for (const d of store.devices) {
      for (const c of d.cards || []) {
        const idx = (c.eids || []).findIndex(e => e.id === eidId)
        if (idx !== -1) {
          foundEid = c.eids.splice(idx, 1)[0]
          fromCard = c
          break
        }
      }
      if (foundEid) break
    }
    if (!foundEid) return null
    // find target card
    let targetCard = null
    for (const d of store.devices) {
      for (const c of d.cards || []) {
        if (c.id === targetCardId) { targetCard = c; break }
      }
      if (targetCard) break
    }
    // if no target, use none card
    if (!targetCard) {
      const noneDevice = store.devices.find(d => d.id === '__none__')
      targetCard = noneDevice && noneDevice.cards && noneDevice.cards.find(c => c.id === '__none_card__')
    }
    if (!targetCard) return null
    // enforce constraints on target card
    const type = targetCard.cardType
    const existingEids = targetCard.eids || []
    if (type === 'native' && existingEids.length >= 1) throw new Error('目标 card 为 native，最多允许 1 个 EID')
    if (type === 'psim' && existingEids.length >= 1) throw new Error('目标 card 为 psim，最多允许 1 个 EID')
    if (type === 'physical' && existingEids.length >= 2) throw new Error('目标 card 为实体卡，最多允许 2 个 EID')
    targetCard.eids = targetCard.eids || []
    targetCard.eids.push(foundEid)
    this._saveStore(store)
    return { moved: true, fromCard: fromCard ? fromCard.id : null, toCard: targetCard.id }
  },

  // Move a profile to another EID (unlink and relink)
  moveProfile (profileId, targetEidId) {
    const store = this._getStore()
    const p = store.profiles.find(x => x.id === profileId)
    if (!p) return null
    // remove from old eid's profiles
    for (const d of store.devices) {
      for (const c of d.cards || []) {
        for (const e of c.eids || []) {
          if (Array.isArray(e.profiles) && e.profiles.includes(profileId)) {
            e.profiles = e.profiles.filter(x => x !== profileId)
          }
        }
      }
    }
    // find target eid
    let targetEid = null
    for (const d of store.devices) {
      for (const c of d.cards || []) {
        for (const e of c.eids || []) {
          if (e.id === targetEidId) { targetEid = e; break }
        }
        if (targetEid) break
      }
      if (targetEid) break
    }
    if (!targetEid) {
      const noneDevice = store.devices.find(d => d.id === '__none__')
      targetEid = noneDevice && noneDevice.cards && noneDevice.cards.find(c => c.id === '__none_card__') && noneDevice.cards.find(c => c.id === '__none_card__').eids.find(e => e.id === '__none_eid__')
    }
    if (!targetEid) return null
    targetEid.profiles = targetEid.profiles || []
    targetEid.profiles.push(profileId)
    p.eidId = targetEid.id
    this._saveStore(store)
    return { moved: true, toEid: targetEid.id }
  },

  getEsimProfiles () {
    const store = this._getStore()
    return store.profiles
  },

  saveEsimProfiles (profiles) {
    const store = this._getStore()
    store.profiles = profiles
    return this._saveStore(store)
  },

  addEsimProfile (profile, eidId) {
    const store = this._getStore()
    const newProfile = Object.assign({ id: Date.now().toString(), nickname: '', operator: '', roamingOperator: '', validUntil: null, balance: 0, monthlyFee: 0, retention: '', createdAt: new Date().toISOString(), affLink: '' }, profile)
    // if eidId provided, link profile to eid
    if (eidId) {
      let linked = false
      for (const device of store.devices) {
        for (const card of device.cards) {
          for (const eid of card.eids) {
            if (eid.id === eidId) {
              // enforce psim rule: if cardType psim only one profile allowed
              if (card.cardType === 'psim' && (eid.profiles || []).length >= 1) throw new Error('psim 的 EID 只能有一个 profile')
              eid.profiles = eid.profiles || []
              eid.profiles.push(newProfile.id)
              linked = true
            }
          }
        }
      }
      if (!linked) throw new Error('eid not found')
      newProfile.eidId = eidId
    }
    store.profiles.push(newProfile)
    this._saveStore(store)
    return newProfile
  },

  updateEsimProfile (id, data) {
    const store = this._getStore()
    const idx = store.profiles.findIndex(p => p.id === id)
    if (idx === -1) return null
    store.profiles[idx] = Object.assign({}, store.profiles[idx], data)
    this._saveStore(store)
    return store.profiles[idx]
  },

  adjustEsimBalance (id, delta) {
    const store = this._getStore()
    const p = store.profiles.find(x => x.id === id)
    if (!p) return false
    p.balance = Number((Number(p.balance || 0) + Number(delta)).toFixed(2))
    this._saveStore(store)
    return true
  },

  extendEsimValidity (id, days) {
    const store = this._getStore()
    const p = store.profiles.find(x => x.id === id)
    if (!p) return false
    const now = p.validUntil ? new Date(p.validUntil) : new Date()
    const newDate = new Date(now.getTime() + Number(days) * 24 * 60 * 60 * 1000)
    p.validUntil = newDate.toISOString()
    this._saveStore(store)
    return true
  },

  removeEsimProfile (id) {
    const store = this._getStore()
    const before = store.profiles.length
    // remove from profiles
    store.profiles = store.profiles.filter(p => p.id !== id)
    // remove references from eids
    for (const device of store.devices) {
      for (const card of device.cards) {
        for (const eid of card.eids) {
          if (Array.isArray(eid.profiles)) eid.profiles = eid.profiles.filter(x => x !== id)
        }
      }
    }
    this._saveStore(store)
    return store.profiles.length !== before
  },

  // 删除 EID：同时清除其 profiles 的关联（将 profile.eidId 设为 undefined/null）
  removeEid (eidId) {
    const store = this._getStore()
    // protect none eid
    if (!eidId || eidId === '__none_eid__') return false
    let found = false
    for (const d of store.devices) {
      for (const c of d.cards || []) {
        const idx = (c.eids || []).findIndex(e => e.id === eidId)
        if (idx !== -1) {
          const removed = c.eids.splice(idx, 1)[0]
          // unlink profiles
          if (Array.isArray(removed.profiles)) {
            for (const pid of removed.profiles) {
              const p = store.profiles.find(x => x.id === pid)
              if (p) p.eidId = null
            }
          }
          found = true
          break
        }
      }
      if (found) break
    }
    if (!found) return false
    this._saveStore(store)
    return true
  },

  // 删除卡片：移除卡片下所有 EID，并清除关联 profile 的 eidId
  removeCard (cardId) {
    const store = this._getStore()
    if (!cardId || cardId === '__none_card__') return false
    for (const d of store.devices) {
      const idx = (d.cards || []).findIndex(c => c.id === cardId)
      if (idx !== -1) {
        const removedCard = d.cards.splice(idx, 1)[0]
        // remove all eids under this card and unlink profiles
        for (const e of (removedCard.eids || [])) {
          if (Array.isArray(e.profiles)) {
            for (const pid of e.profiles) {
              const p = store.profiles.find(x => x.id === pid)
              if (p) p.eidId = null
            }
          }
        }
        this._saveStore(store)
        return true
      }
    }
    return false
  },

  // 删除设备：移除设备及其所有卡片/EID，并清除 profiles 的 eid 关联
  removeDevice (deviceId) {
    const store = this._getStore()
    if (!deviceId || deviceId === '__none__') return false
    const idx = (store.devices || []).findIndex(d => d.id === deviceId)
    if (idx === -1) return false
    const removedDevice = store.devices.splice(idx, 1)[0]
    // unlink profiles referenced by any eids under this device
    for (const c of (removedDevice.cards || [])) {
      for (const e of (c.eids || [])) {
        if (Array.isArray(e.profiles)) {
          for (const pid of e.profiles) {
            const p = store.profiles.find(x => x.id === pid)
            if (p) p.eidId = null
          }
        }
      }
    }
    this._saveStore(store)
    return true
  },

  importEsimProfilesFromFile (filePath) {
    try {
      const content = fs.readFileSync(filePath, { encoding: 'utf-8' })
      const imported = JSON.parse(content)
      if (!Array.isArray(imported)) return null
      const store = this._getStore()
      const mapped = imported.map(p => Object.assign({ id: Date.now().toString() + Math.random().toString(36).slice(2) }, p))
      store.profiles = store.profiles.concat(mapped)
      this._saveStore(store)
      return mapped
    } catch (err) {
      return null
    }
  },

  // Reset all eSIM data to initial state (keeps the reserved none device/card/eid)
  resetEsimStore () {
    const noneEid = { id: '__none_eid__', eid: 'none', nickname: 'none', profiles: [] }
    const noneCard = { id: '__none_card__', cardType: 'none', cardName: '未指定卡片', eids: [noneEid] }
    const noneDevice = { id: '__none__', name: '未指定设备', cards: [noneCard] }
    const initial = { devices: [noneDevice], profiles: [] }
    this._saveStore(initial)
    return true
  }
}
