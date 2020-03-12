import PropTypes from 'prop-types'
import moment from 'moment'
import { List, Icon, Typography, Modal, Popconfirm, message } from 'antd'
const { Text, Paragraph } = Typography

import apiRequest from '../../utils/api-request'
import copy from '../../utils/object-copy'
import { clusterProviderIconSrcMap } from '../../utils/ui-helpers'
import ResourceStatusTag from '../ResourceStatusTag'
import AutoRefreshComponent from './AutoRefreshComponent'

class Cluster extends AutoRefreshComponent {
  static propTypes = {
    team: PropTypes.string.isRequired,
    cluster: PropTypes.object.isRequired,
    namespaceClaims: PropTypes.array.isRequired,
    handleDelete: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {
      cluster: this.props.cluster,
      name: this.props.cluster.metadata.name
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.cluster && prevState.cluster !== this.props.cluster) {
      const state = copy(this.state)
      state.cluster = this.props.cluster
      state.name = this.props.cluster.metadata.name
      this.setState(state)
    }
  }

  finalStateReached(status) {
    const { cluster, name } = this.state
    if (status === 'Success') {
      message.success(`Cluster successfully created: ${cluster.metadata.name}`)
    }
    if (status === 'Failure') {
      message.error(`Cluster failed to create: ${cluster.metadata.name}`)
    }
    if (status === 'Deleted') {
      const { handleDelete } = this.props
      handleDelete && handleDelete(name)
      message.success(`Cluster successfully deleted: ${name}`)
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

    const { team } = this.props
    try {
      const state = copy(this.state)
      const cluster = state.cluster
      await apiRequest(null, 'delete', `/teams/${team}/clusters/${cluster.metadata.name}`)
      cluster.status.status = 'Deleting'
      cluster.metadata.deletionTimestamp = new Date()
      this.setState(state, this.startRefreshing)
      message.loading(`Cluster deletion requested: ${cluster.metadata.name}`)
    } catch (err) {
      console.error('Error deleting cluster', err)
      message.error('Error deleting cluster, please try again.')
    }
  }

  render() {
    const { cluster } = this.state

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
