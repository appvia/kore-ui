import PropTypes from 'prop-types'
import moment from 'moment'
import { List, Avatar, Icon, Typography, Popconfirm, message } from 'antd'
const { Text } = Typography

import ResourceStatusTag from '../ResourceStatusTag'
import AutoRefreshComponent from './AutoRefreshComponent'

class NamespaceClaim extends AutoRefreshComponent {
  static propTypes = {
    team: PropTypes.string.isRequired,
    namespaceClaim: PropTypes.object.isRequired,
    deleteNamespace: PropTypes.func.isRequired
  }

  finalStateReached() {
    const { namespaceClaim } = this.props
    const { spec, status, deleted } = namespaceClaim
    if (deleted) {
      return message.success(`Namespace "${spec.name}" successfully deleted`)
    }
    if (status.status === 'Success') {
      return message.success(`Namespace "${spec.name}" created on cluster "${spec.cluster.name}"`)
    }
    if (status.status === 'Failure') {
      return message.error(`Namespace "${spec.name}" failed to create on cluster "${spec.cluster.name}"`)
    }
  }

  deleteNamespace = () => {
    this.props.deleteNamespace(this.props.namespaceClaim.metadata.name, () => {
      this.startRefreshing()
    })
  }

  render() {
    const { namespaceClaim } = this.props

    if (namespaceClaim.deleted) {
      return null
    }

    const clusterName = namespaceClaim.spec.cluster.name
    const created = moment(namespaceClaim.metadata.creationTimestamp).fromNow()
    const deleted = namespaceClaim.metadata.deletionTimestamp ? moment(namespaceClaim.metadata.deletionTimestamp).fromNow() : false

    const actions = () => {
      const actions = []
      const status = namespaceClaim.status.status || 'Pending'
      if (status === 'Success') {
        const deleteAction = (
          <Popconfirm
            key="delete"
            title="Are you sure you want to delete this namespace?"
            onConfirm={this.deleteNamespace}
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
          title={<Text>{namespaceClaim.spec.name} <Text style={{ fontFamily: 'monospace', marginLeft: '15px' }}>{clusterName}</Text></Text>}
          description={
            <div>
              <Text type='secondary'>Created {created}</Text>
              {deleted ? <Text type='secondary'><br/>Deleted {deleted}</Text> : null }
            </div>
          }
        />
      </List.Item>
    )
  }

}

export default NamespaceClaim
