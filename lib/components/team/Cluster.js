import PropTypes from 'prop-types'
import moment from 'moment'
import { List, Icon, Typography, Modal, Popconfirm, message } from 'antd'
const { Text, Paragraph } = Typography

import apiRequest from '../../utils/api-request'
import { clusterProviderIconSrcMap } from '../../utils/ui-helpers'
import ResourceStatusTag from '../ResourceStatusTag'
import AutoRefreshComponent from './AutoRefreshComponent'

class Cluster extends AutoRefreshComponent {
  static propTypes = {
    team: PropTypes.string.isRequired,
    provider: PropTypes.object.isRequired,
    cluster: PropTypes.object.isRequired,
    namespaceClaims: PropTypes.array.isRequired,
    handleDelete: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      cluster: this.props.cluster
    }
    this.refreshMs = 10000
    this.stateResourceDataKey = 'cluster'
    this.resourceApiPath = `/teams/${props.team}/clusters/${props.cluster.metadata.name}`
  }

  showMessage(status) {
    const cluster = this.state.cluster
    if (status === 'Success') {
      message.success(`Cluster successfully created: ${cluster.metadata.name}`)
    }
    if (status === 'Failure') {
      message.error(`Cluster failed to create: ${cluster.metadata.name}`)
    }
  }

  deleteResource = async () => {
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
              renderItem={ns => <List.Item>{ns.metadata.name}</List.Item>}
            />
          </div>
        ),
        onOk() {}
      })
    }

    const { team, handleDelete } = this.props
    const cluster = this.state.cluster
    try {
      await apiRequest(null, 'delete', `/teams/${team}/clusters/${cluster.metadata.name}`)
      await apiRequest(null, 'delete', `/teams/${team}/gkes/${cluster.metadata.name}`)
      handleDelete(cluster)
    } catch (err) {
      console.error('Error deleting cluster', err)
      message.error('Error deleting cluster, please try again.')
    }
  }

  render() {
    const { cluster } = this.state
    const { provider } = this.props

    const created = moment(cluster.metadata.creationTimestamp).fromNow()

    const actions = () => {
      const actions = []
      const status = cluster.status.status || 'Pending'

      if (status === 'Success') {
        const deleteAction = (
          <Popconfirm
            key="delete"
            title="Are you sure you want to delete this cluster?"
            onConfirm={this.deleteResource}
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
          avatar={<img src={clusterProviderIconSrcMap[provider.spec.resource.kind]} height="32px" />}
          title={<Text>{provider.spec.name} <Text style={{ fontFamily: 'monospace', marginLeft: '15px' }}>{cluster.metadata.name}</Text></Text>}
          description={<Text type='secondary'>Created {created}</Text>}
        />
      </List.Item>
    )
  }

}

export default Cluster
