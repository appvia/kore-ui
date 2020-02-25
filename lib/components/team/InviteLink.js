import React from 'react'
import PropTypes from 'prop-types'
import { Input, Icon, Tooltip } from 'antd'
import apiRequest from '../../utils/api-request'
import copy from '../../utils/object-copy'

class InviteLink extends React.Component {
  static propTypes = {
    team: PropTypes.string.isRequired
  }

  state = {
    dataLoading: true,
    tooltipText: 'Copy',
    icon: 'copy',
    iconColor: '#555'
  }

  async fetchComponentData() {
    const inviteLink = await apiRequest(null, 'get', `/teams/${this.props.team}/invites/generate`)
    return inviteLink
  }

  componentDidMount() {
    return this.fetchComponentData()
      .then(inviteLink => {
        const state = copy(this.state)
        state.inviteLink = `${window.location.origin}/process${inviteLink}`
        state.dataLoading = false
        this.setState(state)
      })
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
    const { inviteLink, tooltipText, iconColor, icon, dataLoading } = this.state

    return (
      <Input
        addonBefore="Invite link"
        addonAfter={<Tooltip title={tooltipText}><Icon style={{ color: iconColor }} type={icon} onClick={this.copyInviteLink} /></Tooltip>}
        ref={inst => this.inviteLinkInput = inst}
        value={dataLoading ? 'Loading...' : inviteLink}
      />
    )
  }
}

export default InviteLink
