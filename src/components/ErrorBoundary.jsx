import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor (props) {
    super(props)
    this.state = { hasError: false, error: null, info: null }
  }

  static getDerivedStateFromError (error) {
    return { hasError: true, error }
  }

  componentDidCatch (error, info) {
    this.setState({ error, info })
    // optionally log to external service
    // console.error('Captured error in ErrorBoundary', error, info)
  }

  render () {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, fontFamily: 'system-ui, -apple-system' }}>
          <h2>应用发生运行时错误</h2>
          <div style={{ whiteSpace: 'pre-wrap', background: '#fff4f4', padding: 12, borderRadius: 6, color: '#b91c1c' }}> {String(this.state.error && this.state.error.toString())}</div>
          <details style={{ marginTop: 12 }}>
            <summary>更多信息</summary>
            <pre style={{ maxHeight: 400, overflow: 'auto' }}>{this.state.info && this.state.info.componentStack}</pre>
          </details>
        </div>
      )
    }
    return this.props.children
  }
}
