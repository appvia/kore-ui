import PropTypes from 'prop-types'
import moment from 'moment'
import { List, Icon, Typography, Modal, Popconfirm, message } from 'antd'
const { Text, Paragraph } = Typography

import { clusterProviderIconSrcMap } from '../../utils/ui-helpers'
import ResourceStatusTag from '../ResourceStatusTag'
import AutoRefreshComponent from './AutoRefreshComponent'

class Cluster extends AutoRefreshComponent {
  static propTypes = {
    team: PropTypes.string.isRequired,
    cluster: PropTypes.object.isRequired,
    namespaceClaims: PropTypes.array.isRequired,
    deleteCluster: PropTypes.func.isRequired
  }

  finalStateReached() {
    const { cluster } = this.props
    const { status, deleted } = cluster
    if (deleted) {
      return message.success(`Cluster successfully deleted: ${cluster.metadata.name}`)
    }
    if (status.status === 'Success') {
      return message.success(`Cluster successfully created: ${cluster.metadata.name}`)
    }
    if (status.status === 'Failure') {
      return message.error(`Cluster failed to create: ${cluster.metadata.name}`)
    }
  }

  deleteCluster = () => {
    const { namespaceClaims } = this.props
    if (namespaceClaims.length > 0) {
      return Modal.warning({
        title: 'Warning: cluster cannot be deleted',
        content: (
          <div>
            <Paragraph strong>The cluster namespaces must be deleted first</Paragraph>
            <List
              size="small"
              dataSource={namespaceClaims}
              renderItem={ns => <List.Item>{ns.spec.name}</List.Item>}
            />
          </div>
        ),
        onOk() {}
      })
    }

    this.props.deleteCluster(this.props.cluster.metadata.name, () => {
      this.startRefreshing()
    })
  }

  render() {
    const { cluster } = this.props

    if (cluster.deleted) {
      return null
    }

    const created = moment(cluster.metadata.creationTimestamp).fromNow()
    const deleted = cluster.metadata.deletionTimestamp ? moment(cluster.metadata.deletionTimestamp).fromNow() : false

    const actions = () => {
      const actions = []
      const status = cluster.status.status || 'Pending'

      if (status === 'Success') {
        const deleteAction = (
          <Popconfirm
            key="delete"
            title="Are you sure you want to delete this cluster?"
            onConfirm={this.deleteCluster}
            okText="Yes"
            cancelText="No"
          >
            <a><Icon type="delete" /></a>
          </Popconfirm>
        )
        actions.push(deleteAction)
      }

      actions.push(<ResourceStatusTag resourceStatus={cluster.status} />)
      return actions
    }

    return (
      <List.Item actions={actions()}>
        <List.Item.Meta
          avatar={<img src={clusterProviderIconSrcMap[cluster.spec.provider.kind]} height="32px" />}
          title={<Text>{cluster.spec.provider.kind} <Text style={{ fontFamily: 'monospace', marginLeft: '15px' }}>{cluster.metadata.name}</Text></Text>}
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

export default Cluster
