import { useEffect, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import lockConfigMap from '../../.config/lock.config.json'
import pkg from '../../package.json'
import './index.css'

export default function Esim () {
  const [profiles, setProfiles] = useState([])
  const [devices, setDevices] = useState([])
  // viewMode removed — views are now inside ManagePanel
  const [moveProfileTargetMap, setMoveProfileTargetMap] = useState({})
  const [theme, setTheme] = useState('light') // 'light' | 'dark'
  const [manageView, setManageView] = useState('profiles') // 'profiles' | 'devices' | 'cards' | 'eids'
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [newDeviceName, setNewDeviceName] = useState('')
  const [newDeviceSelect, setNewDeviceSelect] = useState('')
  const [newCardSelect, setNewCardSelect] = useState('')
  const [newCardType, setNewCardType] = useState('native')
  const [newCardName, setNewCardName] = useState('未指定卡片')
  const [newBoundEid, setNewBoundEid] = useState('')
  const [formDeviceId, setFormDeviceId] = useState('')
  const [formCardId, setFormCardId] = useState('')
  const [newEidInput, setNewEidInput] = useState('')
  const [newNickname, setNewNickname] = useState('')
  const [newPhoneNumber, setNewPhoneNumber] = useState('')
  const [newCountry, setNewCountry] = useState('')
  const [newAreaCode, setNewAreaCode] = useState('')
  const [newApn, setNewApn] = useState('')
  const [newDataBalance, setNewDataBalance] = useState('')
  const [newDataCycle, setNewDataCycle] = useState('lifetime')
  const [newDataUnit, setNewDataUnit] = useState('GB')
  const [newDataPeriod, setNewDataPeriod] = useState('')
  const [newSmsBalance, setNewSmsBalance] = useState('')
  const [newSmsCycle, setNewSmsCycle] = useState('lifetime')
  const [newSmsUnit, setNewSmsUnit] = useState('条')
  const [newSmsPeriod, setNewSmsPeriod] = useState('')
  const [newVoiceBalance, setNewVoiceBalance] = useState('')
  const [newVoiceCycle, setNewVoiceCycle] = useState('lifetime')
  const [newVoiceUnit, setNewVoiceUnit] = useState('分钟')
  const [newVoicePeriod, setNewVoicePeriod] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [newAffLink, setNewAffLink] = useState('')
  const [newEidNicknameInput, setNewEidNicknameInput] = useState('')
  const [newEidNickname, setNewEidNickname] = useState('')
  const [newOperator, setNewOperator] = useState('')
  const [newRoamingOperator, setNewRoamingOperator] = useState('')
  const [newValidUntil, setNewValidUntil] = useState('')
  const [newBalance, setNewBalance] = useState(0)
  const [newMonthlyFee, setNewMonthlyFee] = useState(0)
  const [newRetention, setNewRetention] = useState('')
  // filters removed — profiles listing moved into ManagePanel
  const [showActionForm, setShowActionForm] = useState(false)
  const [actionProfileId, setActionProfileId] = useState(null)
  const [actionAmount, setActionAmount] = useState(0)
  const [actionDays, setActionDays] = useState(0)
  const [actionValidityMode, setActionValidityMode] = useState('extend') // extend | reset
  const [actionTemplateSelect, setActionTemplateSelect] = useState('')
  const [actionTemplateName, setActionTemplateName] = useState('')
  const [actionTemplates, setActionTemplates] = useState([])
  // device/card/eid management inputs
  const [newDeviceInput, setNewDeviceInput] = useState('')
  const [newCardDeviceSelect, setNewCardDeviceSelect] = useState('')
  const [newCardTypeInput, setNewCardTypeInput] = useState('__all__') // also used for filter
  const [newCardNameInput, setNewCardNameInput] = useState('')
  const [newEidDeviceSelect, setNewEidDeviceSelect] = useState('')
  const [newEidCardSelect, setNewEidCardSelect] = useState('')
  const [newEidValueInput, setNewEidValueInput] = useState('')
  const [expandedDevices, setExpandedDevices] = useState({})
  const [expandedCards, setExpandedCards] = useState({})
  const [expandedEids, setExpandedEids] = useState({})
  const [profileViewMode, setProfileViewMode] = useState('nonempty') // compact | nonempty | full
  const [showUid, setShowUid] = useState(false)
  const [hideNoneDevices, setHideNoneDevices] = useState(false)
  const [hideNoneCards, setHideNoneCards] = useState(false)
  const [hideNoneEids, setHideNoneEids] = useState(false)
  const [privacyMode, setPrivacyMode] = useState(false)
  const [creditsHtml, setCreditsHtml] = useState('')
  const lockProfile = (import.meta?.env?.VITE_LOCK_PROFILE || 'main').toLowerCase()
  useEffect(() => {
    ensureTauriServices()
  }, [])
  // tauri/local fallback services
  const ensureTauriServices = () => {
    if (window.services) return
    const readStoreSync = () => {
      try {
        const raw = window.localStorage.getItem('esim_store')
        return raw ? JSON.parse(raw) : null
      } catch (e) { return null }
    }
    const writeStoreSync = (store) => {
      try { window.localStorage.setItem('esim_store', JSON.stringify(store)); return true } catch (e) { return false }
    }
    const ensureNone = (store) => {
      const noneEid = { id: '__none_eid__', eid: 'none', nickname: 'none', profiles: [] }
      const noneCard = { id: '__none_card__', cardType: 'none', cardName: '未指定卡片', eids: [noneEid] }
      const noneDevice = { id: '__none__', name: '未指定设备', cards: [noneCard] }
      store.devices = Array.isArray(store.devices) ? store.devices : []
      store.profiles = Array.isArray(store.profiles) ? store.profiles : []
      if (!store.devices.find(d => d.id === '__none__')) store.devices.unshift(noneDevice)
    }
    window.services = {
      getDevices () { const s = readStoreSync() || { devices: [], profiles: [] }; ensureNone(s); return s.devices },
      getEsimProfiles () { const s = readStoreSync() || { devices: [], profiles: [] }; ensureNone(s); return s.profiles },
      getDevicesAndProfiles () { const s = readStoreSync() || { devices: [], profiles: [] }; ensureNone(s); return { devices: s.devices, profiles: s.profiles } },
      addDevice (device) { const s = readStoreSync() || { devices: [], profiles: [] }; ensureNone(s); const nd = { id: Date.now().toString(), name: device.name || 'Unnamed Device', cards: [] }; s.devices.push(nd); writeStoreSync(s); return nd },
      addCard (deviceId, card) { const s = readStoreSync() || { devices: [], profiles: [] }; ensureNone(s); const dev = s.devices.find(d => d.id === deviceId) || s.devices[0]; const nc = { id: Date.now().toString() + Math.random().toString(36).slice(2), cardType: card.cardType || 'native', cardName: card.cardName || 'Unnamed Card', eids: [] }; dev.cards = dev.cards || []; dev.cards.push(nc); writeStoreSync(s); return nc },
      addEid (deviceId, cardId, eidValue, nickname) { const s = readStoreSync() || { devices: [], profiles: [] }; ensureNone(s); const dev = s.devices.find(d => d.id === deviceId) || s.devices[0]; const card = (dev.cards || []).find(c => c.id === cardId) || (dev.cards || [])[0]; const eid = { id: Date.now().toString() + Math.random().toString(36).slice(2), eid: eidValue, nickname }; card.eids = card.eids || []; card.eids.push(eid); writeStoreSync(s); return eid },
      addEsimProfile (profile, eidId) { const s = readStoreSync() || { devices: [], profiles: [] }; ensureNone(s); const p = { ...profile, id: Date.now().toString(), eidId: eidId || profile.eidId || '__none_eid__' }; s.profiles.push(p); writeStoreSync(s); return p },
      updateDevice (id, patch) { const s = readStoreSync() || { devices: [], profiles: [] }; ensureNone(s); const d = s.devices.find(x => x.id === id); if (d) Object.assign(d, patch); writeStoreSync(s) },
      updateCard (id, patch) { const s = readStoreSync() || { devices: [], profiles: [] }; ensureNone(s); s.devices.forEach(d => { const c = (d.cards || []).find(x => x.id === id); if (c) Object.assign(c, patch) }); writeStoreSync(s) },
      updateEid (id, patch) { const s = readStoreSync() || { devices: [], profiles: [] }; ensureNone(s); s.devices.forEach(d => (d.cards || []).forEach(c => { const e = (c.eids || []).find(x => x.id === id); if (e) Object.assign(e, patch) })); writeStoreSync(s) },
      updateEsimProfile (id, patch) { const s = readStoreSync() || { devices: [], profiles: [] }; ensureNone(s); const p = s.profiles.find(x => x.id === id); if (p) Object.assign(p, patch); writeStoreSync(s) },
      removeEsimProfile (id) { const s = readStoreSync() || { devices: [], profiles: [] }; ensureNone(s); s.profiles = s.profiles.filter(p => p.id !== id); writeStoreSync(s) },
      removeDevice (id) { const s = readStoreSync() || { devices: [], profiles: [] }; ensureNone(s); s.devices = s.devices.filter(d => d.id !== id); writeStoreSync(s) },
      removeCard (id) { const s = readStoreSync() || { devices: [], profiles: [] }; ensureNone(s); s.devices.forEach(d => { d.cards = (d.cards || []).filter(c => c.id !== id) }); writeStoreSync(s) },
      removeEid (id) { const s = readStoreSync() || { devices: [], profiles: [] }; ensureNone(s); s.devices.forEach(d => (d.cards || []).forEach(c => { c.eids = (c.eids || []).filter(e => e.id !== id) })); writeStoreSync(s) },
      resetEsimStore () { const s = { devices: [], profiles: [] }; ensureNone(s); writeStoreSync(s) },
      importEsimProfilesFromFile () { return [] },
      writeTextFile (text) { try { window.localStorage.setItem('esim_last_export', text); return 'localStorage://esim_last_export' } catch (e) { return '' } }
    }
  }
  useEffect(() => {
    ensureTauriServices()
  }, [])
  const lockConfig = lockConfigMap[lockProfile] || lockConfigMap.main || { enabled: true, delayMinutes: 0 }
  const appVersion = import.meta?.env?.VITE_APP_VERSION || pkg.version || ''
  const appBranch = import.meta?.env?.VITE_APP_BRANCH || lockProfile
  const [locked, setLocked] = useState(false)
  const [lockInput, setLockInput] = useState('')
  const [lockError, setLockError] = useState('')
  const lockAnswer = '奶昔' // 本工具首发论坛名称（可修改）
  // 布局可配置
  const defaultLayoutPrefs = {
    reset: true,
    import: true,
    exportAll: true,
    sampleGenerate: true,
    sampleDelete: true,
    sampleCopyJson: true,
    toggleUid: true,
    togglePrivacy: true,
    toggleTheme: true
  }
  const [layoutPrefs, setLayoutPrefs] = useState(defaultLayoutPrefs)
  const [showLayoutModal, setShowLayoutModal] = useState(false)
  const templateProfile = {
    deviceName: '示例设备',
    cardType: 'native',
    cardName: '示例卡片',
    nickname: '示例套餐',
    phoneNumber: '57211275',
    country: '🇪🇪爱沙尼亚',
    areaCode: '+372',
    apn: 'cmnet',
    dataBalance: 10,
    dataUnit: 'GB',
    dataCycle: 'day',
    dataPeriod: 30,
    smsBalance: 0,
    smsUnit: '条',
    smsCycle: 'month',
    smsPeriod: 30,
    voiceBalance: 0,
    voiceUnit: '分钟',
    voiceCycle: 'month',
    voicePeriod: 30,
    operator: 'esim.gg',
    roamingOperator: 'EE',
    balance: 50,
    monthlyFee: 20,
    retention: '每月充值保号',
    affLink: 'https://esim.gge/1esim',
    validUntil: new Date('2025-12-26T01:59:20.407Z').toISOString(),
    notes: '这是一个示例配置'
  }
  // refs for stable focus
  const newDeviceInputRef = useRef(null)
  const newCardNameInputRef = useRef(null)
  const newEidValueInputRef = useRef(null)
  const lockTimerRef = useRef(null)
  // inline edit states
  const [editingDeviceId, setEditingDeviceId] = useState('')
  const [editingDeviceName, setEditingDeviceName] = useState('')
  const [editingCardId, setEditingCardId] = useState('')
  const [editingCardName, setEditingCardName] = useState('')
  const [editingCardType, setEditingCardType] = useState('native')
  const [editingEidId, setEditingEidId] = useState('')
  const [editingEidValue, setEditingEidValue] = useState('')
  const [editingEidNickname, setEditingEidNickname] = useState('')
  const normalizeName = (raw, fallback) => {
    if (typeof raw === 'string') {
      const trimmed = raw.trim()
      return trimmed || fallback
    }
    if (raw && typeof raw === 'object') {
      if (typeof raw.name === 'string') return normalizeName(raw.name, fallback)
      if (typeof raw.cardName === 'string') return normalizeName(raw.cardName, fallback)
      if (typeof raw.eid === 'string') return normalizeName(raw.eid, fallback)
      if (typeof raw.nickname === 'string') return normalizeName(raw.nickname, fallback)
    }
    if (typeof raw === 'number') return raw.toString()
    return fallback
  }
  const ensureDeviceLabel = (value) => normalizeName(value ?? '', '未指定设备')
  const ensureCardLabel = (value) => normalizeName(value ?? '', '未指定卡片')
  const ensureEidLabel = (value) => normalizeName(value ?? '', '未关联')
  const maskMiddle = (value, keepStart = 3, keepEnd = 3) => {
    const str = String(value || '')
    if (!str) return ''
    if (str.length <= keepStart + keepEnd) return '*'.repeat(str.length) || str
    const stars = '*'.repeat(Math.max(3, str.length - keepStart - keepEnd))
    return str.slice(0, keepStart) + stars + str.slice(-keepEnd)
  }
  const displayEid = (value) => {
    const text = ensureEidLabel(value)
    if (!privacyMode) return text
    if (text === '未关联') return text
    return maskMiddle(text, 3, 3)
  }
  const displayPhone = (value) => {
    if (!privacyMode) return value || ''
    const v = (value || '').trim()
    if (!v) return ''
    return maskMiddle(v, 3, 3)
  }
  const resolveDeviceNameById = (id) => {
    const found = devices.find(d => d.id === id)
    return found ? ensureDeviceLabel(found.name) : ensureDeviceLabel('')
  }
  const getNoneTargets = () => {
    const noneDevice = devices.find(d => d.id === '__none__')
    const noneCard = noneDevice && (noneDevice.cards || []).find(c => c.id === '__none_card__')
    const noneEid = noneCard && (noneCard.eids || []).find(e => e.id === '__none_eid__')
    return { noneDeviceId: noneDevice?.id || '__none__', noneCardId: noneCard?.id || '__none_card__', noneEidId: noneEid?.id || '__none_eid__' }
  }
  const attachTemplates = (profile) => {
    const p = { ...profile }
    try {
      const raw = window.localStorage.getItem(`esim_action_templates_${p.id}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) p.actionTemplates = parsed
      }
    } catch (e) {}
    return p
  }
  const findProfilesByEid = (eidId) => profiles.filter(p => p.eidId === eidId)
  const findUnboundProfilesForCard = (card, deviceName) => profiles.filter(p => (!p.eidId || p.eidId === '__none_eid__') && ensureCardLabel(p.cardName) === ensureCardLabel(card.cardName) && ensureDeviceLabel(p.deviceName) === ensureDeviceLabel(deviceName))
  const renderProfileSummary = (p, asList = false) => {
    const fmtCycle = (val, unitLabel, cycle, period) => {
      if (cycle === 'lifetime') return `${val || '-'} ${unitLabel} / 生命周期`
      return `${val || '-'} ${unitLabel} / 每 ${period || '-'} ${cycle === 'day' ? '日' : cycle === 'month' ? '月' : '年'}`
    }
    const lines = [
      { label: '号码', value: displayPhone(p.phoneNumber) },
      { label: '国家/区号', value: `${p.country || ''}${p.areaCode ? ` / ${p.areaCode}` : ''}`.trim() },
      { label: '运营商', value: p.operator || '' },
      { label: '漫游', value: p.roamingOperator || '' },
     { label: '数据', value: fmtCycle(p.dataBalance !== undefined && p.dataBalance !== '' ? Number(p.dataBalance).toFixed(2) : '-', p.dataUnit || 'GB', p.dataCycle || 'lifetime', p.dataPeriod || '-') },
      { label: '短信', value: fmtCycle(p.smsBalance ?? '-', p.smsUnit || '条', p.smsCycle || 'lifetime', p.smsPeriod || '-') },
      { label: '语音', value: fmtCycle(p.voiceBalance ?? '-', p.voiceUnit || '分钟', p.voiceCycle || 'lifetime', p.voicePeriod || '-') },
      { label: '余额', value: Number(p.balance || 0).toFixed(2) },
      { label: '月费', value: Number(p.monthlyFee || 0).toFixed(2) },
      { label: '保号', value: p.retention || '' },
      { label: '到期', value: p.validUntil ? new Date(p.validUntil).toLocaleDateString() : '' },
      { label: 'APN', value: p.apn || '' },
      { label: 'Aff 链接', value: p.affLink || '' },
      { label: '备注', value: p.notes || '' }
    ]
    const filtered = profileViewMode === 'full'
      ? lines
      : profileViewMode === 'compact'
        ? lines.slice(0, 5)
        : lines.filter(l => l.value)
    const renderAff = (value, idx) => {
      const href = value || ''
      return (
        <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span>Aff 链接：</span>
          {href ? (
            <>
              <a href={href} target='_blank' rel='noreferrer'>{href}</a>
              <button type='button' onClick={() => { try { navigator.clipboard?.writeText(href) } catch (e) {} }}>复制</button>
            </>
          ) : (
            <span>-</span>
          )}
        </div>
      )
    }
    if (asList) {
      return filtered.map((l, idx) => l.label === 'Aff 链接'
        ? renderAff(l.value, idx)
        : <div key={idx}>{l.label}：{l.value || '-'}</div>)
    }
    return (
      <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {filtered.map((l, idx) => l.label === 'Aff 链接'
          ? <div key={idx}>{renderAff(l.value, idx)}</div>
          : <div key={idx}>{l.label}：{l.value || '-'}</div>)}
      </div>
    )
  }

  const renderProfilesForEid = (eidId) => {
    const related = findProfilesByEid(eidId)
    if (!related.length) return <div style={{ color: '#888' }}>暂无配置</div>
    return related.map(p => (
      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
        <div>
          <div>
            {p.nickname?.trim() || ensureCardLabel(p.cardName || '')}
            {showUid && <small style={{ color: '#888' }}> UID: {p.id}</small>}
          </div>
          <small style={{ color: '#666' }}>{ensureDeviceLabel(p.deviceName)} / {ensureCardLabel(p.cardName)}</small>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => openAddForm(p)}>编辑</button>
          <button onClick={() => handleRemove(p.id)}>删除</button>
        </div>
      </div>
    ))
  }
  const renderUnboundProfilesForCard = (card, deviceName) => {
    const related = findUnboundProfilesForCard(card, deviceName)
    if (!related.length) return null
    return (
      <div style={{ marginTop: 6 }}>
        <div style={{ color: '#999', marginBottom: 4 }}>未关联 EID 的配置</div>
        {related.map(p => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
            <div>
              <div>{p.nickname?.trim() || ensureCardLabel(p.cardName || '')}</div>
              <small style={{ color: '#666' }}>{ensureDeviceLabel(p.deviceName)} / {ensureCardLabel(p.cardName)}</small>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => openAddForm(p)}>编辑</button>
              <button onClick={() => handleRemove(p.id)}>删除</button>
            </div>
          </div>
        ))}
      </div>
    )
  }
  const resolveCardById = (deviceId, cardId) => {
    const dev = devices.find(d => d.id === deviceId)
    return (dev?.cards || []).find(c => c.id === cardId)
  }
  const resolveEidLabelForProfile = (profile) => {
    if (!profile) return ensureEidLabel('')
    if (profile.eidId && profile.eidId !== '__none_eid__') {
      for (const d of devices) {
        for (const c of d.cards || []) {
          for (const e of c.eids || []) {
            if (e.id === profile.eidId) return ensureEidLabel(e.eid)
          }
        }
      }
    }
    return ensureEidLabel('')
  }

  const load = () => {
    try {
      if (!window.services || typeof window.services.getEsimProfiles !== 'function') {
        throw new Error('preload 服务不可用，请在 uTools 环境中运行')
      }
      const ps = window.services.getEsimProfiles()
      setProfiles(ps)
    } catch (err) {
      setError(err.message || String(err))
    }
  }

  useEffect(() => {
    load()
    // load devices (hierarchical store)
    try {
      if (window.services && typeof window.services.getDevices === 'function') {
        const ds = window.services.getDevices()
        setDevices(ds)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    if (manageView === 'devices') {
      newDeviceInputRef.current?.focus()
    } else if (manageView === 'cards') {
      newCardNameInputRef.current?.focus()
    } else if (manageView === 'eids') {
      newEidValueInputRef.current?.focus()
    }
  }, [manageView])

  useEffect(() => {
    fetch('credits.html')
      .then(res => res.text())
      .then(text => setCreditsHtml(text))
      .catch(() => setCreditsHtml('无法加载 credits.html，请检查文件'))
  }, [])
  useEffect(() => {
    if (!actionProfileId) return
    try {
      const raw = window.localStorage.getItem(`esim_action_templates_${actionProfileId}`)
      const parsed = raw ? JSON.parse(raw) : []
      setActionTemplates(Array.isArray(parsed) ? parsed : [])
    } catch (e) {
      setActionTemplates([])
    }
  }, [actionProfileId])
  useEffect(() => {
    if (!lockConfig.enabled) {
      setLocked(false)
      return
    }
    try {
      const saved = window.localStorage.getItem('esim_unlock')
      if (saved === lockAnswer) {
        setLocked(false)
      } else {
        lockTimerRef.current = setTimeout(() => setLocked(true), (lockConfig.delayMinutes || 0) * 60 * 1000)
      }
    } catch (e) {
      lockTimerRef.current = setTimeout(() => setLocked(true), (lockConfig.delayMinutes || 0) * 60 * 1000)
    }
    return () => {
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current)
    }
  }, [])
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('esim_layout_prefs')
      const parsed = raw ? JSON.parse(raw) : null
      if (parsed && typeof parsed === 'object') setLayoutPrefs(prev => ({ ...prev, ...parsed }))
    } catch (e) {}
  }, [])

  const handleUnlock = (e) => {
    e.preventDefault()
    if ((lockInput || '').trim().toLowerCase() === lockAnswer) {
      setLocked(false)
      setLockError('')
      setLockInput('')
      try { window.localStorage.setItem('esim_unlock', lockAnswer) } catch (e) {}
    } else {
      setLockError('答案不正确，请输入正确的论坛名称解锁')
    }
  }

  const handleSaveLayoutPrefs = () => {
    try {
      window.localStorage.setItem('esim_layout_prefs', JSON.stringify(layoutPrefs))
      setShowLayoutModal(false)
      setMessage('布局设置已保存')
      setTimeout(() => setMessage(''), 2000)
    } catch (e) {
      setError('布局设置保存失败')
    }
  }

  const uniqueDevices = Array.from(new Set(devices.map(d => d.name).filter(Boolean)))

  const loadDevices = () => {
    try {
      if (!window.services || typeof window.services.getDevices !== 'function') {
        setDevices([])
        return
      }
      const ds = window.services.getDevices()
      setDevices(ds)
    } catch (err) {
      console.error(err)
      setDevices([])
    }
  }

  const openAddForm = (profile) => {
    setError('')
    if (profile) {
      setEditingId(profile.id)
      // if device matches existing list, select it; otherwise use custom
      const dev = devices.find(d => d.name === profile.deviceName)
      if (dev) {
        setNewDeviceSelect(dev.id)
        setNewDeviceName(dev.name || '')
        setFormDeviceId(dev.id)
      } else {
        setNewDeviceSelect('__none__')
        setNewDeviceName(profile.deviceName || '')
        setFormDeviceId('')
      }
      setNewCardType(profile.cardType || 'native')
      setNewCardName(ensureCardLabel(profile.cardName || ''))
      // try to resolve device/card ids from profile.deviceName/cardName
      if (dev) {
        const card = (dev.cards || []).find(c => c.cardName === profile.cardName || c.cardName === profile.cardName)
        if (card) {
          setFormCardId(card.id)
          setNewCardSelect(card.id)
          setNewCardType(card.cardType || profile.cardType || 'native')
          setNewCardName(ensureCardLabel(card.cardName))
        } else {
          setNewCardSelect('')
        }
      } else {
        setNewCardSelect('')
      }
      setNewBoundEid(profile.eidId || profile.boundEid || '')
      setNewNickname(profile.nickname || '')
      setNewPhoneNumber(profile.phoneNumber || '')
      setNewCountry(profile.country || '')
      setNewAreaCode(profile.areaCode || '')
      setNewApn(profile.apn || '')
      setNewDataBalance(profile.dataBalance ?? '')
      setNewDataCycle(profile.dataCycle || 'lifetime')
      setNewDataUnit(profile.dataUnit || 'GB')
      setNewDataPeriod(profile.dataPeriod || '')
      setNewSmsBalance(profile.smsBalance ?? '')
      setNewSmsCycle(profile.smsCycle || 'lifetime')
      setNewSmsUnit(profile.smsUnit || '条')
      setNewSmsPeriod(profile.smsPeriod || '')
      setNewVoiceBalance(profile.voiceBalance ?? '')
      setNewVoiceCycle(profile.voiceCycle || 'lifetime')
      setNewVoiceUnit(profile.voiceUnit || '分钟')
      setNewVoicePeriod(profile.voicePeriod || '')
      setNewNotes(profile.notes || '')
      setNewAffLink(profile.affLink || '')
      setNewOperator(profile.operator || '')
      setNewRoamingOperator(profile.roamingOperator || '')
      setNewValidUntil(profile.validUntil ? profile.validUntil.split('T')[0] : '')
      setNewBalance(profile.balance || 0)
      setNewMonthlyFee(profile.monthlyFee || 0)
      setNewRetention(profile.retention || '')
    } else {
      setEditingId(null)
      setNewDeviceSelect('')
      setNewDeviceName('')
      setNewCardSelect('')
      setNewCardType('native')
      setNewCardName('未指定卡片')
      setNewBoundEid('')
      setFormDeviceId('')
      setFormCardId('')
      setNewEidInput('')
      setNewNickname('')
      setNewPhoneNumber('')
      setNewCountry('')
      setNewAreaCode('')
      setNewApn('')
      setNewDataBalance('')
      setNewDataCycle('lifetime')
      setNewDataUnit('GB')
      setNewDataPeriod('')
      setNewSmsBalance('')
      setNewSmsCycle('lifetime')
      setNewSmsUnit('条')
      setNewSmsPeriod('')
      setNewVoiceBalance('')
      setNewVoiceCycle('lifetime')
      setNewVoiceUnit('分钟')
      setNewVoicePeriod('')
      setNewNotes('')
      setNewAffLink('')
      setNewOperator('')
      setNewRoamingOperator('')
      setNewValidUntil('')
      setNewBalance(0)
      setNewMonthlyFee(0)
      setNewRetention('')
    }
    setShowAddForm(true)
  }

  const closeAddForm = () => {
    setShowAddForm(false)
  }

  const submitAddForm = async (e) => {
    e.preventDefault()
    if (!window.services || typeof window.services.addEsimProfile !== 'function') {
      const msg = 'preload 服务不可用：无法添加/修改配置，请在 uTools 插件环境中运行'
      setError(msg)
      return
    }
    // 内嵌新建：设备与卡片（若选择“新建”选项，在提交时创建）
    let selectedDeviceId = newDeviceSelect
    if (selectedDeviceId === '__create_device__' && newDeviceName.trim()) {
      const created = handleAddDevice(ensureDeviceLabel(newDeviceName))
      if (created && created.id) {
        selectedDeviceId = created.id
        setNewDeviceSelect(created.id)
        setFormDeviceId(created.id)
      }
    }
    let selectedCardId = newCardSelect
    const deviceIdForCard = formDeviceId || selectedDeviceId
    if (selectedCardId === '__create_card__' && deviceIdForCard) {
      const created = handleAddCard(deviceIdForCard, newCardType, newCardName)
      if (created && created.id) {
        selectedCardId = created.id
        setNewCardSelect(created.id)
        setFormCardId(created.id)
      }
    }
    const finalDeviceNameRaw = selectedDeviceId ? resolveDeviceNameById(selectedDeviceId) : newDeviceName
    const finalDeviceName = ensureDeviceLabel(finalDeviceNameRaw)
    const payload = {
      deviceName: finalDeviceName,
      cardType: newCardType,
      cardName: ensureCardLabel(newCardName),
      // profile does not include eids array; it links to a single eid via eidId
      boundEid: '',
      nickname: newNickname,
      phoneNumber: newPhoneNumber,
      country: newCountry,
      areaCode: newAreaCode,
      operator: newOperator,
      roamingOperator: newRoamingOperator,
      validUntil: newValidUntil ? new Date(newValidUntil).toISOString() : null,
      balance: Number(newBalance || 0),
      monthlyFee: Number(newMonthlyFee || 0),
      retention: newRetention,
      phoneNumber: newPhoneNumber,
      country: newCountry,
      areaCode: newAreaCode,
      apn: newApn,
      dataBalance: newDataBalance,
      dataCycle: newDataCycle,
      dataUnit: newDataUnit,
      dataPeriod: newDataPeriod,
      smsBalance: newSmsBalance,
      smsCycle: newSmsCycle,
      smsUnit: newSmsUnit,
      smsPeriod: newSmsPeriod,
      voiceBalance: newVoiceBalance,
      voiceCycle: newVoiceCycle,
      voiceUnit: newVoiceUnit,
      voicePeriod: newVoicePeriod,
      affLink: newAffLink,
      notes: newNotes
    }
    try {
      // determine eidId to link (only single eid allowed for profile)
      let eidId = null
      // if bound selection matches an existing eid id, use it
      if (newBoundEid) {
        // search devices for matching eid id
        for (const d of devices) {
          for (const c of d.cards || []) {
            for (const ev of c.eids || []) {
              if (ev.id === newBoundEid) eidId = ev.id
            }
          }
        }
      }
      // create new eid if选择了新建
      if (newBoundEid === '__create_eid__' && newEidInput.trim()) {
        const created = window.services.addEid(selectedDeviceId || deviceIdForCard || '', selectedCardId || formCardId || '', newEidInput.trim(), (newEidNickname || '').trim())
        if (created && created.id) {
          eidId = created.id
          setNewBoundEid(created.id)
        }
      }
      // if still no eidId, but newBoundEid is some raw eid string (not id), try to find by value
      if (!eidId && newBoundEid) {
        for (const d of devices) {
          for (const c of d.cards || []) {
            for (const ev of c.eids || []) {
              if (ev.eid === newBoundEid) eidId = ev.id
            }
          }
        }
      }

      if (editingId) {
        const current = profiles.find(p => p.id === editingId)
        const currentEidId = current?.eidId || ''
        window.services.updateEsimProfile(editingId, payload)
        if (typeof window.services.moveProfile === 'function' && currentEidId !== (eidId || '')) {
          window.services.moveProfile(editingId, eidId || '__none_eid__')
        }
        setMessage('修改成功')
      } else {
        // call addEsimProfile with or without eidId
        if (eidId && typeof window.services.addEsimProfile === 'function') {
          const added = window.services.addEsimProfile(payload, eidId)
          payload.boundEid = (added && added.eid) || newEidInput || ''
        } else if (typeof window.services.addEsimProfile === 'function') {
          const added = window.services.addEsimProfile(payload)
          payload.boundEid = ''
        }
        setMessage('添加成功')
      }
      setTimeout(() => setMessage(''), 2000)
      closeAddForm()
      load()
      loadDevices()
    } catch (err) {
      console.error(err)
      setError(err.message || String(err))
    }
  }

  // Device / Card / EID creation handlers
  const handleAddDevice = (name) => {
    try {
      if (!window.services || typeof window.services.addDevice !== 'function') throw new Error('preload 服务不可用')
      const d = window.services.addDevice({ name: ensureDeviceLabel(name) })
      loadDevices()
      return d
    } catch (err) {
      setError(err.message || String(err))
      return null
    }
  }

  const handleAddCard = (deviceId, cardType, cardName) => {
    try {
      if (!window.services || typeof window.services.addCard !== 'function') throw new Error('preload 服务不可用')
      const c = window.services.addCard(deviceId, { cardType, cardName: ensureCardLabel(cardName) })
      loadDevices()
      return c
    } catch (err) {
      setError(err.message || String(err))
      return null
    }
  }

  const handleAddEid = (deviceId, cardId, eidValue) => {
    try {
      if (!window.services || typeof window.services.addEid !== 'function') throw new Error('preload 服务不可用')
      const e = window.services.addEid(deviceId, cardId, eidValue, ensureEidLabel(newEidNicknameInput))
      loadDevices()
      return e
    } catch (err) {
      setError(err.message || String(err))
      return null
    }
  }

  const handleMoveCard = (cardId, targetDeviceId) => {
    try {
      if (!window.services || typeof window.services.moveCard !== 'function') throw new Error('preload 服务不可用')
      const res = window.services.moveCard(cardId, targetDeviceId)
      loadDevices()
      load()
      return res
    } catch (err) {
      setError(err.message || String(err))
      return null
    }
  }

  const handleMoveEid = (eidId, targetCardId) => {
    try {
      if (!window.services || typeof window.services.moveEid !== 'function') throw new Error('preload 服务不可用')
      const res = window.services.moveEid(eidId, targetCardId)
      loadDevices()
      load()
      return res
    } catch (err) {
      setError(err.message || String(err))
      return null
    }
  }

  const startEditDevice = (device) => {
    setEditingDeviceId(device.id)
    setEditingDeviceName(device.name || '')
  }
  const saveEditDevice = () => {
    if (!editingDeviceId) return
    const trimmed = (editingDeviceName || '').trim()
    if (!trimmed) return
    try {
      if (!window.services || typeof window.services.updateDevice !== 'function') throw new Error('preload 服务不可用')
      window.services.updateDevice(editingDeviceId, { name: ensureDeviceLabel(trimmed) })
      setEditingDeviceId('')
      setEditingDeviceName('')
      loadDevices()
      load()
    } catch (err) {
      setError(err.message || String(err))
    }
  }
  const cancelEditDevice = () => {
    setEditingDeviceId('')
    setEditingDeviceName('')
  }

  const startEditCard = (card) => {
    setEditingCardId(card.id)
    setEditingCardName(card.cardName || '')
    setEditingCardType(card.cardType || 'native')
  }
  const saveEditCard = () => {
    if (!editingCardId) return
    const name = (editingCardName || '').trim()
    if (!name) return
    const allowed = ['physical', 'psim', 'native']
    const typeVal = allowed.includes(editingCardType) ? editingCardType : 'native'
    try {
      if (!window.services || typeof window.services.updateCard !== 'function') throw new Error('preload 服务不可用')
      window.services.updateCard(editingCardId, { cardName: ensureCardLabel(name), cardType: typeVal })
      setEditingCardId('')
      setEditingCardName('')
      setEditingCardType('native')
      loadDevices()
      load()
    } catch (err) {
      setError(err.message || String(err))
    }
  }
  const cancelEditCard = () => {
    setEditingCardId('')
    setEditingCardName('')
    setEditingCardType('native')
  }

  const startEditEid = (eid) => {
    setEditingEidId(eid.id)
    setEditingEidValue(eid.eid || '')
    setEditingEidNickname(eid.nickname || '')
  }
  const saveEditEid = () => {
    if (!editingEidId) return
    try {
      if (!window.services || typeof window.services.updateEid !== 'function') throw new Error('preload 服务不可用')
      window.services.updateEid(editingEidId, { eid: (editingEidValue || '').trim(), nickname: (editingEidNickname || '').trim() })
      setEditingEidId('')
      setEditingEidValue('')
      setEditingEidNickname('')
      loadDevices()
      load()
    } catch (err) {
      setError(err.message || String(err))
    }
  }
  const cancelEditEid = () => {
    setEditingEidId('')
    setEditingEidValue('')
    setEditingEidNickname('')
  }

  const handleMoveProfile = (profileId, targetEidId) => {
    try {
      if (!window.services || typeof window.services.moveProfile !== 'function') throw new Error('preload 服务不可用')
      const res = window.services.moveProfile(profileId, targetEidId)
      loadDevices()
      load()
      return res
    } catch (err) {
      setError(err.message || String(err))
      return null
    }
  }

  const handleRemove = (id) => {
    if (!window.confirm('确认删除该 eSIM 配置吗？')) return
    try {
      if (!window.services || typeof window.services.removeEsimProfile !== 'function') {
        throw new Error('preload 服务不可用')
      }
      window.services.removeEsimProfile(id)
      load()
    } catch (err) {
      setError(err.message || String(err))
    }
  }

  // 删除设备/卡片/EID（管理和视图共用）
  const handleRemoveDevice = (deviceId) => {
    if (!deviceId || deviceId === '__none__') return
    const cascade = window.confirm('确定删除设备及其所有子项？\n选择“确定”将一并删除子项，选择“取消”则迁移子项到“未指定”后删除设备。')
    try {
      if (!window.services || typeof window.services.removeDevice !== 'function') {
        throw new Error('preload 服务不可用：removeDevice 不存在')
      }
      if (!cascade) {
        const { noneDeviceId } = getNoneTargets()
        const targetDev = devices.find(d => d.id === deviceId)
        for (const card of (targetDev?.cards || [])) {
          handleMoveCard(card.id, noneDeviceId)
        }
      }
      window.services.removeDevice(deviceId)
      loadDevices()
      load()
    } catch (err) {
      setError(err.message || String(err))
    }
  }

  const handleRemoveCard = (cardId) => {
    if (!cardId || cardId === '__none_card__') return
    const cascade = window.confirm('确定删除卡片及其 EID？\n选择“确定”一并删除，选择“取消”则迁移其 EID 到“未指定”后删除卡片。')
    try {
      if (!window.services || typeof window.services.removeCard !== 'function') {
        throw new Error('preload 服务不可用：removeCard 不存在')
      }
      if (!cascade) {
        const { noneCardId } = getNoneTargets()
        const srcCard = devices.flatMap(d => d.cards || []).find(c => c.id === cardId)
        for (const e of (srcCard?.eids || [])) {
          handleMoveEid(e.id, noneCardId)
        }
      }
      window.services.removeCard(cardId)
      loadDevices()
      load()
    } catch (err) {
      setError(err.message || String(err))
    }
  }

  const handleRemoveEid = (eidId) => {
    if (!eidId || eidId === '__none_eid__') return
    const cascade = window.confirm('确定删除该 EID？\n选择“确定”删除并解绑配置，选择“取消”则先将配置指向未关联后删除。')
    try {
      if (!window.services || typeof window.services.removeEid !== 'function') {
        throw new Error('preload 服务不可用：removeEid 不存在')
      }
      if (!cascade) {
        const { noneEidId } = getNoneTargets()
        const related = findProfilesByEid(eidId)
        for (const p of related) {
          handleMoveProfile(p.id, noneEidId)
        }
      }
      window.services.removeEid(eidId)
      loadDevices()
      load()
    } catch (err) {
      setError(err.message || String(err))
    }
  }

  const handleImport = () => {
    try {
      if (!window.services || typeof window.services.importEsimProfilesFromFile !== 'function') {
        throw new Error('preload 服务不可用')
      }
      const files = window.utools.showOpenDialog({ title: '选择要导入的 eSIM 文件', properties: ['openFile'] })
      if (!files) return
      const filePath = files[0]
      const result = window.services.importEsimProfilesFromFile(filePath)
      if (!result) {
        window.utools.showNotification('导入失败或文件格式不正确')
      } else {
        window.utools.showNotification('导入成功: ' + result.length + ' 条')
        load()
      }
    } catch (err) {
      setError(err.message || String(err))
    }
  }

  const handleExport = (profile) => {
    try {
      if (!window.services || typeof window.services.writeTextFile !== 'function') {
        throw new Error('preload 服务不可用')
      }
      const filePath = window.services.writeTextFile(JSON.stringify(attachTemplates(profile), null, 2))
      window.utools.shellShowItemInFolder(filePath)
    } catch (err) {
      setError(err.message || String(err))
    }
  }

  const handleExportAll = () => {
    try {
      if (!window.services || typeof window.services.writeTextFile !== 'function') {
        throw new Error('preload 服务不可用')
      }
      const data = JSON.stringify(profiles.map(p => attachTemplates(p)), null, 2)
      const filePath = window.services.writeTextFile(data)
      window.utools.shellShowItemInFolder(filePath)
    } catch (err) {
      setError(err.message || String(err))
    }
  }

  const handleResetAll = () => {
    if (!window.confirm('确认重置所有 eSIM 数据吗？此操作不可撤销')) return
    try {
      if (!window.services || typeof window.services.resetEsimStore !== 'function') {
        throw new Error('preload 服务不可用：无法重置')
      }
      window.services.resetEsimStore()
      load()
      loadDevices()
      setMessage('已重置')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setError(err.message || String(err))
    }
  }

  const handleRemoveSample = () => {
    try {
      if (!window.services) throw new Error('preload 服务不可用')
      let removed = false
      // 移除示例设备（会一并删除其卡片/EID/配置）
      for (const d of devices) {
        if (ensureDeviceLabel(d.name) === ensureDeviceLabel(templateProfile.deviceName)) {
          window.services.removeDevice?.(d.id)
          removed = true
        }
      }
      // 冗余清理：若还有匹配的示例配置，直接删配置
      for (const p of profiles) {
        if (ensureCardLabel(p.cardName) === ensureCardLabel(templateProfile.cardName) || (p.nickname && p.nickname.includes('示例'))) {
          window.services.removeEsimProfile?.(p.id)
          removed = true
        }
      }
      if (removed) {
        setMessage('示例数据已删除')
        setTimeout(() => setMessage(''), 2000)
        load()
        loadDevices()
      } else {
        setMessage('未找到示例数据')
        setTimeout(() => setMessage(''), 2000)
      }
    } catch (err) {
      setError(err.message || String(err))
    }
  }

  const applyTemplateProfile = () => {
    try {
      if (!window.services || typeof window.services.addDevice !== 'function') throw new Error('preload 服务不可用')
      const device = window.services.addDevice({ name: `${templateProfile.deviceName}` })
      const card = window.services.addCard(device.id, { cardType: templateProfile.cardType, cardName: templateProfile.cardName })
      const eidValue = '8904' + Math.random().toString().slice(2, 14)
      const eid = window.services.addEid(device.id, card.id, eidValue, '示例EID')
      const payload = { ...templateProfile, deviceName: device.name, cardName: card.cardName, cardType: card.cardType }
      const added = window.services.addEsimProfile(payload, eid.id)
      // 为示例配置放置默认的使用/充值模板，便于体验
      if (added && added.id) {
        const demoTemplates = [
          { name: '示例续期 30 天', amount: 0, days: 30, mode: 'extend' },
          { name: '示例充值 50', amount: 50, days: 0, mode: 'extend' }
        ]
        try { window.localStorage.setItem(`esim_action_templates_${added.id}`, JSON.stringify(demoTemplates)) } catch (e) {}
      }
      setMessage('已生成示例配置（含示例模板）')
      setTimeout(() => setMessage(''), 2000)
      load()
      loadDevices()
    } catch (err) {
      setError(err.message || String(err))
    }
  }

  const copyTemplateProfile = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(templateProfile, null, 2))
      setMessage('模版 JSON 已复制')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setError('无法复制模版 JSON')
    }
  }

  useEffect(() => {
    try {
      const t = window.localStorage.getItem('esim_theme') || 'light'
      setTheme(t)
    } catch (e) {}
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    try { window.localStorage.setItem('esim_theme', next) } catch (e) {}
  }

  const managePanel = (
    <div className='esim-manage' style={{ marginBottom: 12 }}>
      <strong>配置 / 设备 / 卡片 / EID</strong>
      <div className='manage-tabs' style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className={"manage-tab " + (manageView === 'profiles' ? 'active' : '')} onClick={() => setManageView('profiles')}>配置</button>
        <button className={"manage-tab " + (manageView === 'devices' ? 'active' : '')} onClick={() => setManageView('devices')}>设备</button>
        <button className={"manage-tab " + (manageView === 'cards' ? 'active' : '')} onClick={() => setManageView('cards')}>卡片</button>
        <button className={"manage-tab " + (manageView === 'eids' ? 'active' : '')} onClick={() => setManageView('eids')}>EID 管理</button>
      </div>

      <div className='manage-panel' style={{ marginTop: 12, padding: 8, border: '1px solid var(--border,#e6e6e6)', borderRadius: 6 }}>
        {manageView === 'devices' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input ref={newDeviceInputRef} placeholder='新建设备名' value={newDeviceInput} onChange={e => setNewDeviceInput(e.target.value)} />
            <button onClick={() => { handleAddDevice((newDeviceInput || '').trim()); setNewDeviceInput('') }}>新建设备</button>
            <button onClick={() => setHideNoneDevices(prev => !prev)}>{hideNoneDevices ? '显示未指定设备' : '隐藏未指定设备'}</button>
          </div>
        )}
        {manageView === 'devices' && (
          <div style={{ marginTop: 8 }}>
            {(hideNoneDevices ? devices.filter(d => d.id !== '__none__') : devices).map(d => (
              <div key={d.id} style={{ padding: 6, borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, marginRight: 8 }}>
                    {editingDeviceId === d.id ? (
                      <input value={editingDeviceName} onChange={e => setEditingDeviceName(e.target.value)} style={{ width: '100%' }} />
                    ) : (
                      <span>{ensureDeviceLabel(d.name)} {showUid && <small style={{ color: '#888' }}>UID: {d.id}</small>}</span>
                    )}
                  </div>
                  <button onClick={() => setExpandedDevices(prev => ({ ...prev, [d.id]: !prev[d.id] }))}>{expandedDevices[d.id] ? '收起' : '展开'}</button>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {editingDeviceId === d.id ? (
                      <>
                        <button onClick={saveEditDevice}>保存</button>
                        <button onClick={cancelEditDevice}>取消</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEditDevice(d)}>编辑</button>
                        <button onClick={() => handleRemoveDevice(d.id)}>删除</button>
                      </>
                    )}
                  </div>
                </div>
                {expandedDevices[d.id] && (
                  <div style={{ marginTop: 6, paddingLeft: 12, borderLeft: '2px solid #eee' }}>
                    {(d.cards || []).length === 0 && <div style={{ color: '#888' }}>暂无卡片</div>}
                    {(d.cards || [])
                      .filter(c => !hideNoneCards || !c.id.startsWith('__none_card__'))
                      .filter(c => newCardTypeInput === '__all__' || c.cardType === newCardTypeInput)
                      .map(card => (
                      <div key={card.id} style={{ marginBottom: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                          <div>{ensureCardLabel(card.cardName)} <small style={{ color: '#666' }}>（{card.cardType || '-'}{showUid ? ` / UID: ${card.id}` : ''}）</small></div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => startEditCard(card)}>编辑</button>
                            <button onClick={() => handleRemoveCard(card.id)}>删除</button>
                            <button onClick={() => setExpandedCards(prev => ({ ...prev, [card.id]: !prev[card.id] }))}>{expandedCards[card.id] ? '收起' : '展开'}</button>
                          </div>
                        </div>
                        {expandedCards[card.id] && (
                          <div style={{ marginTop: 4, paddingLeft: 12, borderLeft: '2px dashed #ddd' }}>
                            {(card.eids || []).length === 0 && <div style={{ color: '#888' }}>暂无 EID</div>}
                            {(card.eids || []).filter(eid => !hideNoneEids || (!eid.id.startsWith('__none_eid__') && eid.eid !== 'none')).map(e => (
                              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
                                <div>{displayEid(e.eid)} <small style={{ color: '#666' }}>{e.nickname ? `(${e.nickname})` : ''}{showUid ? ` / UID: ${e.id}` : ''}</small></div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button onClick={() => setExpandedEids(prev => ({ ...prev, [e.id]: !prev[e.id] }))}>{expandedEids[e.id] ? '收起配置' : '展开配置'}</button>
                                  <button onClick={() => startEditEid(e)}>编辑</button>
                                  <button onClick={() => handleRemoveEid(e.id)}>删除</button>
                                </div>
                              </div>
                            ))}
                            {(card.eids || []).map(e => (
                              expandedEids[e.id] && (
                                <div key={e.id + '_profiles'} style={{ marginLeft: 12, paddingLeft: 8, borderLeft: '2px dotted #ccc', marginBottom: 6 }}>
                                  {renderProfilesForEid(e.id)}
                                </div>
                              )
                            ))}
                            {renderUnboundProfilesForCard(card, d.name)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {manageView === 'cards' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={newCardDeviceSelect} onChange={e => setNewCardDeviceSelect(e.target.value)}>
              <option value=''>选择设备（用于新增卡片）</option>
              {devices.map(d => <option key={d.id} value={d.id}>{ensureDeviceLabel(d.name)}</option>)}
            </select>
            <select value={newCardTypeInput} onChange={e => setNewCardTypeInput(e.target.value)}>
              <option value='__all__'>全部类型（筛选）</option>
              <option value='physical'>实体esim卡</option>
              <option value='psim'>实体sim卡</option>
              <option value='native'>原生esim</option>
            </select>
            <input ref={newCardNameInputRef} placeholder='卡名' value={newCardNameInput} onChange={e => setNewCardNameInput(e.target.value)} />
            <button onClick={() => {
              const createType = newCardTypeInput === '__all__' ? 'native' : newCardTypeInput
              handleAddCard(newCardDeviceSelect || '', createType, newCardNameInput)
              setNewCardNameInput('')
            }}>新增卡片</button>
            <button onClick={() => setHideNoneCards(prev => !prev)}>{hideNoneCards ? '显示未指定卡片' : '隐藏未指定卡片'}</button>
          </div>
        )}
        {manageView === 'profiles' && (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <button onClick={() => openAddForm(null)}>新建配置</button>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#666' }}>显示：</span>
                <button className={profileViewMode === 'compact' ? 'active' : ''} onClick={() => setProfileViewMode('compact')}>简略</button>
                <button className={profileViewMode === 'nonempty' ? 'active' : ''} onClick={() => setProfileViewMode('nonempty')}>非空</button>
                <button className={profileViewMode === 'full' ? 'active' : ''} onClick={() => setProfileViewMode('full')}>全部</button>
              </div>
            </div>
            {profiles.length === 0 && <div>暂无配置</div>}
            {profiles.map(p => (
              <div key={p.id} className='esim-item' style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>
                  {p.nickname?.trim() || ensureCardLabel(p.cardName || '')}
                  {showUid && <small style={{ color: '#888' }}> UID: {p.id}</small>}
                </div>
                <div style={{ color: '#555', marginTop: 2 }}>卡片：{ensureCardLabel(p.cardName)}（{p.cardType || '-'}）</div>
                <div style={{ color: '#555', marginTop: 2 }}>设备：{ensureDeviceLabel(p.deviceName)}</div>
                  <div style={{ color: '#555', marginTop: 2 }}>EID：{displayEid(resolveEidLabelForProfile(p))}</div>
                {renderProfileSummary(p)}
                <div style={{ marginTop: 6 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <select value={moveProfileTargetMap[p.id] || ''} onChange={e => setMoveProfileTargetMap(prev => ({ ...prev, [p.id]: e.target.value }))}>
                      <option value=''>选择目标 EID（移动 profile）</option>
                      {devices.flatMap(d => (d.cards || []).flatMap(c => (c.eids || []).map(e => ({ device: d, card: c, eid: e })))).map(item => (
                        <option key={item.eid.id} value={item.eid.id}>{ensureEidLabel(item.eid.eid)} — {ensureDeviceLabel(item.device.name)} / {ensureCardLabel(item.card.cardName)}</option>
                      ))}
                    </select>
                    <button onClick={() => { const target = moveProfileTargetMap[p.id]; if (target) handleMoveProfile(p.id, target) }}>移动 Profile</button>
                    <button onClick={() => handleExport(p)}>导出</button>
                    <button onClick={() => openAddForm(p)} style={{ marginLeft: 8 }}>编辑</button>
              <button onClick={() => {
                setActionProfileId(p.id)
                setShowActionForm(true)
                setActionAmount(0)
                setActionDays(0)
                setActionValidityMode('extend')
                setActionTemplateSelect('')
                setActionTemplateName('')
              }} style={{ marginLeft: 8 }}>使用/充值</button>
                    <button onClick={() => { handleRemove(p.id) }} style={{ marginLeft: 8 }}>删除</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {manageView === 'cards' && (
          <div style={{ marginTop: 8 }}>
            {(newCardDeviceSelect ? (devices.find(d => d.id === newCardDeviceSelect)?.cards || []) : devices.flatMap(d => d.cards || []).map(c => c))
              .filter(card => !hideNoneCards || !String(card.id).startsWith('__none_card__'))
              .filter(card => newCardTypeInput === '__all__' || card.cardType === newCardTypeInput)
              .map(card => {
              const parentDevice = devices.find(d => (d.cards || []).some(x => x.id === card.id))
              const parentName = ensureDeviceLabel(parentDevice?.name)
              return (
                <div key={card.id} style={{ padding: 6, borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                    <div>
                      {editingCardId === card.id ? (
                        <>
                          <input value={editingCardName} onChange={e => setEditingCardName(e.target.value)} style={{ width: '100%', marginBottom: 4 }} />
                          <select value={editingCardType} onChange={e => setEditingCardType(e.target.value)} style={{ width: '100%', marginBottom: 4 }}>
                            <option value='physical'>实体esim卡</option>
                            <option value='psim'>实体sim卡</option>
                            <option value='native'>原生esim</option>
                          </select>
                        </>
                      ) : (
                        <strong>{ensureCardLabel(card.cardName)}</strong>
                      )}
                      <small style={{ color: '#666' }}>（{editingCardId === card.id ? editingCardType : (card.cardType || '-')} / {parentName}{showUid ? ` / UID: ${card.id}` : ''}）</small>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button onClick={() => setExpandedCards(prev => ({ ...prev, [card.id]: !prev[card.id] }))}>{expandedCards[card.id] ? '收起' : '展开'}</button>
                      {editingCardId === card.id ? (
                        <>
                          <button onClick={saveEditCard}>保存</button>
                          <button onClick={cancelEditCard}>取消</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEditCard(card)}>编辑</button>
                          <button onClick={() => handleRemoveCard(card.id)}>删除</button>
                        </>
                      )}
                    </div>
                  </div>
                  {expandedCards[card.id] && (
                    <div style={{ marginTop: 4, paddingLeft: 12, borderLeft: '2px dashed #ddd' }}>
                      {(card.eids || []).length === 0 && <div style={{ color: '#888' }}>暂无 EID</div>}
                      {(card.eids || []).map(e => (
                        <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
                          <div>{displayEid(e.eid)} <small style={{ color: '#666' }}>{e.nickname ? `(${e.nickname})` : ''}{showUid ? ` / UID: ${e.id}` : ''}</small></div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => setExpandedEids(prev => ({ ...prev, [e.id]: !prev[e.id] }))}>{expandedEids[e.id] ? '收起配置' : '展开配置'}</button>
                            <button onClick={() => startEditEid(e)}>编辑</button>
                            <button onClick={() => handleRemoveEid(e.id)}>删除</button>
                          </div>
                        </div>
                      ))}
                      {(card.eids || []).map(e => (
                        expandedEids[e.id] && (
                          <div key={e.id + '_profiles_card'} style={{ marginLeft: 12, paddingLeft: 8, borderLeft: '2px dotted #ccc', marginBottom: 6 }}>
                            {renderProfilesForEid(e.id)}
                          </div>
                        )
                      ))}
                      {renderUnboundProfilesForCard(card, parentName)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {manageView === 'eids' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={newEidDeviceSelect} onChange={e => { setNewEidDeviceSelect(e.target.value); setNewEidCardSelect('') }}>
              <option value=''>选择设备（用于新增 EID）</option>
              {devices.map(d => <option key={d.id} value={d.id}>{ensureDeviceLabel(d.name)}</option>)}
            </select>
            <select value={newEidCardSelect} onChange={e => setNewEidCardSelect(e.target.value)}>
              <option value=''>选择卡片</option>
              {(devices.find(d => d.id === newEidDeviceSelect)?.cards || []).map(c => <option key={c.id} value={c.id}>{ensureCardLabel(c.cardName)}（{c.cardType || '-'}）</option>)}
            </select>
            <input ref={newEidValueInputRef} placeholder='EID 值' value={newEidValueInput} onChange={e => setNewEidValueInput(e.target.value)} />
            <input placeholder='EID 昵称（可选）' value={newEidNicknameInput} onChange={e => setNewEidNicknameInput(e.target.value)} />
            <button onClick={() => { if (newEidDeviceSelect && newEidCardSelect && newEidValueInput.trim()) { handleAddEid(newEidDeviceSelect, newEidCardSelect, newEidValueInput.trim()); setNewEidValueInput(''); setNewEidNicknameInput('') } }}>新增 EID 并绑定</button>
            <button onClick={() => setHideNoneEids(prev => !prev)}>{hideNoneEids ? '显示未指定 EID' : '隐藏未指定 EID'}</button>
          </div>
        )}
        {manageView === 'eids' && (
          <div style={{ marginTop: 8 }}>
            {(newEidDeviceSelect ? (devices.find(d => d.id === newEidDeviceSelect)?.cards || []).flatMap(c => c.eids || []) : devices.flatMap(d => (d.cards || []).flatMap(c => c.eids || [])))
              .filter(e => !hideNoneEids || (!String(e.id).startsWith('__none_eid__') && e.eid !== 'none'))
              .map(eid => (
              <div key={eid.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 6, borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ flex: 1, marginRight: 8 }}>
                  {editingEidId === eid.id ? (
                    <>
                      <input value={editingEidValue} onChange={e => setEditingEidValue(e.target.value)} style={{ width: '100%', marginBottom: 4 }} />
                      <input value={editingEidNickname} onChange={e => setEditingEidNickname(e.target.value)} style={{ width: '100%' }} placeholder='昵称（可空）' />
                    </>
                  ) : (
                    <>
                      {displayEid(eid.eid)} <small style={{ color: '#666' }}>{eid.nickname ? `(${eid.nickname})` : ''}{showUid ? ` / UID: ${eid.id}` : ''}</small>
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button onClick={() => setExpandedEids(prev => ({ ...prev, [eid.id]: !prev[eid.id] }))}>{expandedEids[eid.id] ? '收起配置' : '展开配置'}</button>
                  {editingEidId === eid.id ? (
                    <>
                      <button onClick={saveEditEid}>保存</button>
                      <button onClick={cancelEditEid}>取消</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEditEid(eid)}>编辑</button>
                      <button onClick={() => handleRemoveEid(eid.id)}>删除</button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {(newEidDeviceSelect ? (devices.find(d => d.id === newEidDeviceSelect)?.cards || []).flatMap(c => c.eids || []) : devices.flatMap(d => (d.cards || []).flatMap(c => c.eids || [])))
              .filter(e => !hideNoneEids || (!String(e.id).startsWith('__none_eid__') && e.eid !== 'none'))
              .map(eid => (
                expandedEids[eid.id] && (
                  <div key={eid.id + '_profiles_list'} style={{ paddingLeft: 12, borderLeft: '2px dotted #ccc', marginBottom: 6 }}>
                    {renderProfilesForEid(eid.id)}
                  </div>
                )
              ))}
          </div>
        )}

        <div style={{ marginTop: 8 }}>
          <small>提示：新增 EID 后可在新建 profile 时选择绑定的 EID。</small>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`esim ${theme}`}>
      {locked && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <form onSubmit={handleUnlock} style={{ background: '#fff', padding: 20, borderRadius: 10, minWidth: 320, boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}>
            <h3 style={{ marginTop: 0 }}>解锁提示</h3>
            <p style={{ marginBottom: 8 }}>回答问题以继续：本工具首发于哪个论坛？</p>
            <input autoFocus value={lockInput} onChange={e => setLockInput(e.target.value)} placeholder='请输入论坛名称' style={{ width: '100%', marginBottom: 8 }} />
            {lockError && <div style={{ color: '#b91c1c', marginBottom: 8 }}>{lockError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type='submit'>解锁</button>
            </div>
          </form>
        </div>
      )}
      {showLayoutModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998 }}>
          <div style={{ background: '#fff', padding: 16, borderRadius: 10, minWidth: 320, maxWidth: 420, boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}>
            <h3 style={{ marginTop: 0 }}>布局设置</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <label><input type='checkbox' checked={layoutPrefs.reset} onChange={e => setLayoutPrefs(prev => ({ ...prev, reset: e.target.checked }))} /> 重置全部</label>
              <label><input type='checkbox' checked={layoutPrefs.import} onChange={e => setLayoutPrefs(prev => ({ ...prev, import: e.target.checked }))} /> 从文件导入</label>
              <label><input type='checkbox' checked={layoutPrefs.exportAll} onChange={e => setLayoutPrefs(prev => ({ ...prev, exportAll: e.target.checked }))} /> 导出全部</label>
              <label><input type='checkbox' checked={layoutPrefs.sampleGenerate} onChange={e => setLayoutPrefs(prev => ({ ...prev, sampleGenerate: e.target.checked }))} /> 生成示例</label>
              <label><input type='checkbox' checked={layoutPrefs.sampleDelete} onChange={e => setLayoutPrefs(prev => ({ ...prev, sampleDelete: e.target.checked }))} /> 删除示例</label>
              <label><input type='checkbox' checked={layoutPrefs.sampleCopyJson} onChange={e => setLayoutPrefs(prev => ({ ...prev, sampleCopyJson: e.target.checked }))} /> 复制示例 JSON</label>
              <label><input type='checkbox' checked={layoutPrefs.toggleUid} onChange={e => setLayoutPrefs(prev => ({ ...prev, toggleUid: e.target.checked }))} /> UID 开关</label>
              <label><input type='checkbox' checked={layoutPrefs.togglePrivacy} onChange={e => setLayoutPrefs(prev => ({ ...prev, togglePrivacy: e.target.checked }))} /> 隐私开关</label>
              <label><input type='checkbox' checked={layoutPrefs.toggleTheme} onChange={e => setLayoutPrefs(prev => ({ ...prev, toggleTheme: e.target.checked }))} /> 主题切换</label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button onClick={() => setShowLayoutModal(false)}>取消</button>
              <button onClick={handleSaveLayoutPrefs}>保存</button>
            </div>
          </div>
        </div>
      )}
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        eSIM 管理 <sub style={{ color: '#666', fontWeight: 400 }}>{appVersion} · {appBranch}</sub>
      </h2>
      <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {layoutPrefs.reset && <button onClick={handleResetAll} style={{ color: '#b91c1c' }}>重置全部</button>}
          {layoutPrefs.import && <button onClick={handleImport}>从文件导入</button>}
          {layoutPrefs.exportAll && <button onClick={handleExportAll}>导出全部</button>}
          {layoutPrefs.sampleDelete && <button onClick={handleRemoveSample}>删除示例配置</button>}
          {layoutPrefs.sampleGenerate && <button onClick={applyTemplateProfile}>生成示例配置</button>}
          {layoutPrefs.sampleCopyJson && <button onClick={copyTemplateProfile}>复制示例 JSON</button>}
          {layoutPrefs.toggleUid && <button onClick={() => setShowUid(prev => !prev)}>{showUid ? '隐藏 UID' : '显示 UID'}</button>}
          {layoutPrefs.togglePrivacy && <button onClick={() => setPrivacyMode(prev => !prev)}>{privacyMode ? '关闭隐私模式' : '开启隐私模式'}</button>}
          {layoutPrefs.toggleTheme && <button onClick={toggleTheme}>{theme === 'light' ? '切换夜间' : '切换白天'}</button>}
          <button onClick={() => setShowLayoutModal(true)}>布局设置</button>
          {message && <span style={{ color: '#15803d' }}>{message}</span>}
        </div>
      </div>
      {/* 主视图已整合到管理面板（下方） */}

      <div style={{ marginBottom: 8, padding: 8, border: '1px dashed #ddd', borderRadius: 6, fontFamily: "'Yeats Sang', cursive" }}>
        <div dangerouslySetInnerHTML={{ __html: creditsHtml || '加载中...' }} />
      </div>

      {/* 配置/设备/卡片/EID 统一管理面板 */}
      {managePanel}
      {showAddForm && (
        <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={submitAddForm} style={{ background: '#fff', padding: 16, borderRadius: 8, minWidth: 420, maxWidth: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>{editingId ? '编辑 eSIM 配置' : '添加 eSIM 配置'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13 }}>设备（列表选择）</label>
                <div style={{ maxHeight: 120, overflowY: 'auto', border: '1px solid #eee', padding: 8, borderRadius: 6 }}>
                  {devices.map(d => (
                    <label key={d.id} style={{ display: 'block', marginBottom: 6, cursor: 'pointer' }}>
                      <input
                        type='radio'
                        name='deviceSelect'
                        value={d.id}
                        checked={newDeviceSelect === d.id}
                        onChange={() => {
                          setNewDeviceSelect(d.id)
                          setFormDeviceId(d.id)
                          setNewDeviceName(d.name || '')
                          setNewCardSelect('')
                          setFormCardId('')
                          setNewBoundEid('')
                        }}
                        style={{ marginRight: 6 }}
                      />
                      {ensureDeviceLabel(d.name)}
                    </label>
                  ))}
                  <label style={{ display: 'block', marginBottom: 6, cursor: 'pointer' }}>
                    <input
                      type='radio'
                      name='deviceSelect'
                      value='__create_device__'
                      checked={newDeviceSelect === '__create_device__'}
                      onChange={() => {
                        setNewDeviceSelect('__create_device__')
                        setFormDeviceId('')
                        setNewDeviceName('')
                        setNewCardSelect('')
                        setFormCardId('')
                        setNewBoundEid('')
                      }}
                      style={{ marginRight: 6 }}
                    />
                    新建设备
                  </label>
                </div>
                {newDeviceSelect === '__create_device__' && (
                  <div style={{ marginTop: 6 }}>
                    <input
                      placeholder='输入设备名'
                      value={newDeviceName}
                      onChange={e => setNewDeviceName(e.target.value)}
                      style={{ width: '100%', marginBottom: 6 }}
                    />
                    <button
                      type='button'
                      disabled={!newDeviceName.trim()}
                      onClick={() => {
                        const created = handleAddDevice(ensureDeviceLabel(newDeviceName))
                        if (created && created.id) {
                          setNewDeviceSelect(created.id)
                          setFormDeviceId(created.id)
                          setNewDeviceName(created.name || '')
                        }
                      }}
                      style={{ width: '100%' }}
                    >
                      创建并选中
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13 }}>卡名称</label>
                <div style={{ maxHeight: 120, overflowY: 'auto', border: '1px solid #eee', padding: 8, borderRadius: 6 }}>
                  {(devices.find(d => d.id === (formDeviceId || newDeviceSelect))?.cards || []).map(c => (
                    <label key={c.id} style={{ display: 'block', marginBottom: 6, cursor: 'pointer' }}>
                      <input
                        type='radio'
                        name='cardSelect'
                        value={c.id}
                        checked={newCardSelect === c.id}
                        onChange={() => {
                          setNewCardSelect(c.id)
                          setFormCardId(c.id)
                          setNewCardName(ensureCardLabel(c.cardName))
                          setNewCardType(c.cardType || 'native')
                          setNewBoundEid('')
                        }}
                        style={{ marginRight: 6 }}
                      />
                      {ensureCardLabel(c.cardName)}（{c.cardType || '-'}）
                    </label>
                  ))}
                  <label style={{ display: 'block', marginBottom: 6, cursor: 'pointer' }}>
                    <input
                      type='radio'
                      name='cardSelect'
                      value='__create_card__'
                      checked={newCardSelect === '__create_card__'}
                      onChange={() => {
                        setNewCardSelect('__create_card__')
                        setFormCardId('')
                        setNewBoundEid('')
                        setNewCardName('未指定卡片')
                        setNewCardType('native')
                      }}
                      style={{ marginRight: 6 }}
                    />
                    新建卡片
                  </label>
                  {(devices.find(d => d.id === (formDeviceId || newDeviceSelect))?.cards || []).length === 0 && <div style={{ color: '#888' }}>该设备暂无卡片</div>}
                </div>
                <select
                  value={newCardType}
                  onChange={e => setNewCardType(e.target.value)}
                  style={{ width: '100%', marginTop: 6 }}
                  disabled={!!newCardSelect && newCardSelect !== '__create_card__'}
                >
                  <option value='physical'>实体esim卡</option>
                  <option value='psim'>实体sim卡</option>
                  <option value='native'>原生esim</option>
                </select>
                <input value={newCardName} onChange={e => setNewCardName(e.target.value)} style={{ width: '100%', marginTop: 6 }} placeholder='卡片名称' disabled={!!newCardSelect && newCardSelect !== '__create_card__'} />
                {newCardSelect === '__create_card__' && (
                  <button
                    type='button'
                    style={{ width: '100%', marginTop: 6 }}
                    disabled={!(formDeviceId || (newDeviceSelect && newDeviceSelect !== '__create_device__'))}
                    onClick={() => {
                      const targetDevId = formDeviceId || (newDeviceSelect && newDeviceSelect !== '__create_device__' ? newDeviceSelect : '')
                      if (!targetDevId) return
                      const created = handleAddCard(targetDevId, newCardType, newCardName)
                      if (created && created.id) {
                        setNewCardSelect(created.id)
                        setFormCardId(created.id)
                        setNewCardName(created.cardName || newCardName)
                      }
                    }}
                  >
                    创建并选中
                  </button>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13 }}>别名 (nickname)</label>
                <input value={newNickname} onChange={e => setNewNickname(e.target.value)} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13 }}>号码</label>
                <input value={newPhoneNumber} onChange={e => setNewPhoneNumber(e.target.value)} style={{ width: '100%' }} placeholder='手机号或编号' />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13 }}>国家/地区</label>
                <input value={newCountry} onChange={e => setNewCountry(e.target.value)} style={{ width: '100%' }} placeholder='例如 中国/美国' />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13 }}>区号</label>
                <input value={newAreaCode} onChange={e => setNewAreaCode(e.target.value)} style={{ width: '100%' }} placeholder='例如 +86 / +1' />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13 }}>APN</label>
                <input value={newApn} onChange={e => setNewApn(e.target.value)} style={{ width: '100%' }} placeholder='接入点名称' />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 13 }}>Aff 链接</label>
                <input value={newAffLink} onChange={e => setNewAffLink(e.target.value)} style={{ width: '100%' }} placeholder='https://...' />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13 }}>数据流量 (GB)</label>
                <input type='number' step='0.01' value={newDataBalance} onChange={e => setNewDataBalance(e.target.value)} style={{ width: '100%' }} />
                <select value={newDataUnit} onChange={e => setNewDataUnit(e.target.value)} style={{ width: '100%', marginTop: 4 }}>
                  <option value='GB'>GB</option>
                  <option value='MB'>MB</option>
                </select>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <input type='number' placeholder='每期数量' value={newDataPeriod} onChange={e => setNewDataPeriod(e.target.value)} style={{ width: '40%' }} disabled={newDataCycle === 'lifetime'} />
                  <select value={newDataCycle} onChange={e => setNewDataCycle(e.target.value)} style={{ width: '60%' }}>
                    <option value='lifetime'>生命周期</option>
                    <option value='day'>日</option>
                    <option value='month'>月</option>
                    <option value='year'>年</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13 }}>短信剩余</label>
                <input type='number' value={newSmsBalance} onChange={e => setNewSmsBalance(e.target.value)} style={{ width: '100%' }} />
                <select value={newSmsUnit} onChange={e => setNewSmsUnit(e.target.value)} style={{ width: '100%', marginTop: 4 }}>
                  <option value='条'>条</option>
                  <option value='次'>次</option>
                </select>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <input type='number' placeholder='每期数量' value={newSmsPeriod} onChange={e => setNewSmsPeriod(e.target.value)} style={{ width: '40%' }} disabled={newSmsCycle === 'lifetime'} />
                  <select value={newSmsCycle} onChange={e => setNewSmsCycle(e.target.value)} style={{ width: '60%' }}>
                    <option value='lifetime'>生命周期</option>
                    <option value='day'>日</option>
                    <option value='month'>月</option>
                    <option value='year'>年</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13 }}>语音剩余 (分钟)</label>
                <input type='number' value={newVoiceBalance} onChange={e => setNewVoiceBalance(e.target.value)} style={{ width: '100%' }} />
                <select value={newVoiceUnit} onChange={e => setNewVoiceUnit(e.target.value)} style={{ width: '100%', marginTop: 4 }}>
                  <option value='分钟'>分钟</option>
                  <option value='小时'>小时</option>
                </select>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <input type='number' placeholder='每期数量' value={newVoicePeriod} onChange={e => setNewVoicePeriod(e.target.value)} style={{ width: '40%' }} disabled={newVoiceCycle === 'lifetime'} />
                  <select value={newVoiceCycle} onChange={e => setNewVoiceCycle(e.target.value)} style={{ width: '60%' }}>
                    <option value='lifetime'>生命周期</option>
                    <option value='day'>日</option>
                    <option value='month'>月</option>
                    <option value='year'>年</option>
                  </select>
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 13 }}>备注</label>
                <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} style={{ width: '100%' }} rows={2} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 13 }}>选择 EID</label>
                <div style={{ maxHeight: 120, overflowY: 'auto', border: '1px solid #eee', padding: 8, borderRadius: 6 }}>
                  <label style={{ display: 'block', marginBottom: 6, cursor: 'pointer' }}>
                    <input type='radio' name='eidSelect' value='' checked={!newBoundEid} onChange={() => setNewBoundEid('')} style={{ marginRight: 6 }} />
                    （未关联）
                  </label>
                  {(newCardSelect
                    ? (resolveCardById(formDeviceId || newDeviceSelect, newCardSelect)?.eids || [])
                    : (devices.find(d => d.id === (formDeviceId || newDeviceSelect))?.cards || []).flatMap(c => c.eids || [])
                  ).filter(e => e && e.id !== '__none_eid__' && e.eid !== 'none').map(e => (
                    <label key={e.id} style={{ display: 'block', marginBottom: 6, cursor: 'pointer' }}>
                      <input
                        type='radio'
                        name='eidSelect'
                        value={e.id}
                        checked={newBoundEid === e.id}
                        onChange={() => setNewBoundEid(e.id)}
                        style={{ marginRight: 6 }}
                      />
                      {ensureEidLabel(e.eid)}
                    </label>
                  ))}
                  <label style={{ display: 'block', marginBottom: 6, cursor: 'pointer' }}>
                    <input
                      type='radio'
                      name='eidSelect'
                      value='__create_eid__'
                      checked={newBoundEid === '__create_eid__'}
                      onChange={() => setNewBoundEid('__create_eid__')}
                      style={{ marginRight: 6 }}
                    />
                    新建 EID
                  </label>
                  {(newCardSelect
                    ? (resolveCardById(formDeviceId || newDeviceSelect, newCardSelect)?.eids || []).filter(e => e && e.id !== '__none_eid__' && e.eid !== 'none').length === 0
                    : (devices.find(d => d.id === (formDeviceId || newDeviceSelect))?.cards || []).flatMap(c => c.eids || []).filter(e => e && e.id !== '__none_eid__' && e.eid !== 'none').length === 0) && (
                      <div style={{ color: '#888' }}>暂无 EID</div>
                  )}
                </div>
                {newBoundEid === '__create_eid__' && (
                  <div style={{ marginTop: 6 }}>
                    <input value={newEidInput} onChange={e => setNewEidInput(e.target.value)} placeholder='输入新 EID 值' style={{ width: '100%', marginBottom: 6 }} />
                    <input value={newEidNickname} onChange={e => setNewEidNickname(e.target.value)} placeholder='EID 昵称（可选）' style={{ width: '100%', marginBottom: 6 }} />
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13 }}>运营商</label>
                <input value={newOperator} onChange={e => setNewOperator(e.target.value)} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13 }}>漫游运营商</label>
                <input value={newRoamingOperator} onChange={e => setNewRoamingOperator(e.target.value)} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13 }}>有效期 (到期日)</label>
                <input type='date' value={newValidUntil} onChange={e => setNewValidUntil(e.target.value)} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13 }}>余额</label>
                <input type='number' step='0.01' value={newBalance} onChange={e => setNewBalance(e.target.value)} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13 }}>月费</label>
                <input type='number' step='0.01' value={newMonthlyFee} onChange={e => setNewMonthlyFee(e.target.value)} style={{ width: '100%' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 13 }}>保号条件</label>
                <input value={newRetention} onChange={e => setNewRetention(e.target.value)} style={{ width: '100%' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button type='button' onClick={closeAddForm}>取消</button>
              <button type='submit'>保存</button>
            </div>
          </form>
        </div>
      )}
      {error && <div className='esim-error'>{error}</div>}
      {showActionForm && (
        <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={async (e) => {
            e.preventDefault()
            try {
              if (actionAmount) window.services.adjustEsimBalance(actionProfileId, Number(actionAmount))
              if (actionDays) {
                if (actionValidityMode === 'reset' && typeof window.services.resetEsimValidityFromToday === 'function') {
                  window.services.resetEsimValidityFromToday(actionProfileId, Number(actionDays))
                } else {
                  window.services.extendEsimValidity(actionProfileId, Number(actionDays))
                }
              }
              setMessage('操作成功')
              setTimeout(() => setMessage(''), 2000)
              setShowActionForm(false)
              load()
            } catch (err) {
              setError(err.message || String(err))
            }
          }} style={{ background: '#fff', padding: 16, borderRadius: 8, minWidth: 320 }}>
            <h3 style={{ marginTop: 0 }}>使用 / 充值（对已绑定的 eSIM）</h3>
            <div style={{ marginBottom: 8 }}>
              <label>模板快速填充</label>
              <select value={actionTemplateSelect} onChange={e => {
                const val = e.target.value
                setActionTemplateSelect(val)
                const t = actionTemplates.find(x => x.name === val)
                if (t) {
                  setActionAmount(t.amount)
                  setActionDays(t.days)
                  setActionValidityMode(t.mode || 'extend')
                }
              }} style={{ width: '100%', marginBottom: 4 }}>
                <option value=''>选择模板</option>
                {actionTemplates.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
              </select>
              <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                <input placeholder='模板名称' value={actionTemplateName} onChange={e => setActionTemplateName(e.target.value)} style={{ flex: 1 }} />
                <button type='button' onClick={saveActionTemplate}>保存为模板</button>
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>金额（正为充值，负为消费）</label>
              <input type='number' step='0.01' value={actionAmount} onChange={e => setActionAmount(e.target.value)} style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>有效期操作</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type='radio' name='validityMode' value='extend' checked={actionValidityMode === 'extend'} onChange={() => setActionValidityMode('extend')} />
                  延长（在当前基础上加天数）
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type='radio' name='validityMode' value='reset' checked={actionValidityMode === 'reset'} onChange={() => setActionValidityMode('reset')} />
                  重置（从今天起加天数）
                </label>
              </div>
              <input type='number' value={actionDays} onChange={e => setActionDays(e.target.value)} style={{ width: '100%' }} placeholder='天数（正数）' />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type='button' onClick={() => setShowActionForm(false)}>取消</button>
              <button type='submit'>提交</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
  const saveActionTemplate = () => {
    if (!actionProfileId) return
    const name = (actionTemplateName || actionTemplateSelect || '').trim()
    if (!name) {
      setActionTemplateName('')
      setLockError('')
      setMessage('请输入模板名称')
      setTimeout(() => setMessage(''), 1500)
      return
    }
    const tpl = {
      name,
      amount: Number(actionAmount || 0),
      days: Number(actionDays || 0),
      mode: actionValidityMode || 'extend'
    }
    const next = [...actionTemplates.filter(t => t.name !== tpl.name), tpl]
    setActionTemplates(next)
    try {
      window.localStorage.setItem(`esim_action_templates_${actionProfileId}`, JSON.stringify(next))
    } catch (e) {}
    setActionTemplateSelect(tpl.name)
    setMessage('模板已保存')
    setTimeout(() => setMessage(''), 2000)
  }
