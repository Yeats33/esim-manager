import { useEffect, useState } from 'react'
import Esim from './ESIM'

export default function App () {
  const [enterAction, setEnterAction] = useState({})

  useEffect(() => {
    if (window.utools) {
      window.utools.onPluginEnter((action) => {
        setEnterAction(action)
      })
      window.utools.onPluginOut(() => {
        setEnterAction({})
      })
    }
  }, [])

  return <Esim enterAction={enterAction} />
}
