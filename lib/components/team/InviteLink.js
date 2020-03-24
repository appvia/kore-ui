import React from 'react'
import PropTypes from 'prop-types'
import { Input, Icon, Tooltip } from 'antd'
import apiRequest from '../../utils/api-request'
import apiPaths from '../../utils/api-paths'
import copy from '../../utils/object-copy'

class InviteLink extends React.Component {
  static propTypes = {
    team: PropTypes.string.isRequired
  }

  state = {
    dataLoading: true,
    dataError: false,
    tooltipText: 'Copy',
    icon: 'copy',
    iconColor: '#555'
  }

  async fetchComponentData() {
    const inviteLink = await apiRequest(null, 'get', apiPaths.team(this.props.team).generateInviteLink)
    const state = copy(this.state)
    if (typeof inviteLink !== 'string') {
      state.dataError = true
    }
    state.inviteLink = inviteLink
    state.dataLoading = false
    this.setState(state)
  }

  componentDidMount() {
    this.fetchComponentData()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.team !== this.props.team) {
      const state = copy(this.state)
      state.dataLoading = true
      this.setState(state)

      this.fetchComponentData()
    }
  }

  copyInviteLink = () => {
    clearInterval(this.interval)
    this.inviteLinkInput.select()
    document.execCommand('copy')
    const state = copy(this.state)
    state.tooltipText = 'Copied!'
    state.icon = 'check'
    state.iconColor = '#52c41a'
    this.setState(state)
    this.interval = setInterval(() => {
      const state = copy(this.state)
      state.tooltipText = 'Copy'
      state.icon = 'copy'
      state.iconColor = '#555'
      this.setState(state)
      clearInterval(this.interval)
    }, 2500)
  }

  render() {
    const { inviteLink, tooltipText, iconColor, icon, dataLoading, dataError } = this.state
    const hideCopyButton = dataLoading || dataError
    const copyValue = dataLoading ? 'Loading...' : dataError ? 'Error generating link' : inviteLink

    return (
      <Input
        addonBefore="Invite link"
        addonAfter={hideCopyButton ? null : <Tooltip title={tooltipText}><Icon style={{ color: iconColor }} type={icon} onClick={this.copyInviteLink} /></Tooltip>}
        ref={inst => this.inviteLinkInput = inst}
        value={copyValue}
      />
    )
  }
}

export default InviteLink
