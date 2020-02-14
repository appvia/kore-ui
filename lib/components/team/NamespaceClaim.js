import PropTypes from 'prop-types'
import * as React from 'react'
import moment from 'moment'
import { List, Avatar, Icon, Typography, Popconfirm, message } from 'antd'
const { Text } = Typography

import apiRequest from '../../utils/api-request'
import copy from '../../utils/object-copy'
import ResourceStatusTag from '../ResourceStatusTag'

class NamespaceClaim extends React.Component {
  static propTypes = {
    team: PropTypes.string.isRequired,
    namespaceClaim: PropTypes.object.isRequired,
    handleDelete: PropTypes.func.isRequired
  }

  state = {
    namespaceClaim: this.props.namespaceClaim
  }

  checkClearInterval() {
    if (this.state.namespaceClaim.status.status === 'Success') {
      clearInterval(this.interval)
    }
  }

  async fetchResource() {
    const team = this.props.team
    const ncName = this.state.namespaceClaim.metadata.name
    const namespaceClaim = await apiRequest(null, 'get', `/teams/${team}/namespaceclaims/${ncName}`)
    return namespaceClaim
  }

  deleteResource = async () => {
    const { team, handleDelete } = this.props
    const namespaceClaim = this.state.namespaceClaim
    try {
      await apiRequest(null, 'delete', `/teams/${team}/namespaceclaims/${namespaceClaim.metadata.name}`)
      handleDelete(namespaceClaim)
    } catch (err) {
      console.error('Error deleting namespace', err)
      message.error('Error deleting namespace, please try again.')
    }
  }

  componentDidMount() {
    if (this.state.namespaceClaim.status.status !== 'Success') {
      this.interval = setInterval(async () => {
        const namespaceClaim = await this.fetchResource()
        const state = copy(this.state)
        state.namespaceClaim = namespaceClaim
        this.setState(state)
        this.checkClearInterval()
      }, 2000)
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
    const { namespaceClaim } = this.state

    const clusterName = namespaceClaim.spec.cluster.name
    const created = moment(namespaceClaim.metadata.creationTimestamp).fromNow()

    const actions = () => {
      const actions = []
      const status = namespaceClaim.status.status || 'Pending'
      if (status === 'Success') {
        const deleteAction = (
          <Popconfirm
            key="delete"
            title="Are you sure you want to delete this namespace?"
            onConfirm={this.deleteResource}
            okText="Yes"
            cancelText="No"
          >
            <a><Icon type="delete" /></a>
          </Popconfirm>
        )
        actions.push(deleteAction)
      }
      actions.push(<ResourceStatusTag status={status} />)
      return actions
    }

    return (
      <List.Item actions={actions()}>
        <List.Item.Meta
          avatar={<Avatar icon="block" />}
          title={<Text>{namespaceClaim.metadata.name} <Text style={{ fontFamily: 'monospace', marginLeft: '15px' }}>{clusterName}</Text></Text>}
          description={<div><Text type='secondary'>Created {created}</Text></div>}
        />
      </List.Item>
    )
  }

}

export default NamespaceClaim
