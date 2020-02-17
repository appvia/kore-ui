import PropTypes from 'prop-types'
import moment from 'moment'
import { List, Avatar, Icon, Typography, Popconfirm, message } from 'antd'
const { Text } = Typography

import apiRequest from '../../utils/api-request'
import copy from '../../utils/object-copy'
import ResourceStatusTag from '../ResourceStatusTag'
import AutoRefreshComponent from './AutoRefreshComponent'

class NamespaceClaim extends AutoRefreshComponent {
  static propTypes = {
    team: PropTypes.string.isRequired,
    namespaceClaim: PropTypes.object.isRequired,
    handleDelete: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {
      namespaceClaim: props.namespaceClaim
    }
    this.refreshMs = 2000
    this.stateResourceDataKey = 'namespaceClaim'
    this.resourceApiPath = `/teams/${props.team}/namespaceclaims/${props.namespaceClaim.metadata.name}`
  }

  showMessage(status) {
    const namespaceClaim = this.state.namespaceClaim
    if (status === 'Success') {
      message.success(`Namespace "${namespaceClaim.spec.name}" created on cluster "${namespaceClaim.spec.cluster.name}"`)
    }
    if (status === 'Failure') {
      message.error(`Namespace "${namespaceClaim.spec.name}" failed to create on cluster "${namespaceClaim.spec.cluster.name}"`)
    }
  }

  deleteResource = async () => {
    const { team, handleDelete } = this.props
    try {
      const state = copy(this.state)
      const namespaceClaim = state.namespaceClaim
      await apiRequest(null, 'delete', `/teams/${team}/namespaceclaims/${state.namespaceClaim.metadata.name}`)
      state.namespaceClaim.deleted = true
      this.setState(state)
      handleDelete && handleDelete(namespaceClaim)
      message.success(`Namespace deleted: ${state.namespaceClaim.spec.name}`)
    } catch (err) {
      console.error('Error deleting namespace', err)
      message.error('Error deleting namespace, please try again.')
    }
  }

  render() {
    const { namespaceClaim } = this.state

    if (namespaceClaim.deleted) {
      return null
    }

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
      actions.push(<ResourceStatusTag resourceStatus={namespaceClaim.status} />)
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
