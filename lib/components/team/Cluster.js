import PropTypes from 'prop-types'
import * as React from 'react'
import moment from 'moment'
import { List, Icon, Typography, Modal, Popconfirm, Popover, Timeline, Tag, message } from 'antd'
const { Text, Paragraph } = Typography

import apiRequest from '../../utils/api-request'
import copy from '../../utils/object-copy'

class Cluster extends React.Component {
  static propTypes = {
    team: PropTypes.string.isRequired,
    provider: PropTypes.object.isRequired,
    cluster: PropTypes.object.isRequired,
    namespaceClaims: PropTypes.array.isRequired,
    handleDelete: PropTypes.func.isRequired
  }

  state = {
    cluster: this.props.cluster
  }

  checkClearInterval() {
    if (this.state.cluster.status.status === 'Success') {
      clearInterval(this.interval)
    }
  }

  async fetchResource() {
    const team = this.props.team
    const clusterName = this.state.cluster.metadata.name
    const cluster = await apiRequest(null, 'get', `/teams/${team}/clusters/${clusterName}`)
    return cluster
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

  componentDidMount() {
    if (this.state.cluster.status.status !== 'Success') {
      this.interval = setInterval(async () => {
        const cluster = await this.fetchResource()
        const state = copy(this.state)
        state.cluster = cluster
        this.setState(state)
        this.checkClearInterval()
      }, 10000)
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
    const { cluster } = this.state
    const { provider } = this.props

    const created = moment(cluster.metadata.creationTimestamp).fromNow()

    const statusColorMap = { 'Success': 'green', 'Pending': 'orange' }
    const clusterProviderIconSrcMap = {
      'GKECredentials': '/static/images/GKE.png',
      'EKSCredentials': '/static/images/EKS.png'
    }

    const actions = () => {
      const actions = []
      const status = cluster.status.status || 'Pending'
      const statusTag = <Tag color={statusColorMap[status] || 'red'}>{status === 'Pending' ? <Icon type="loading" /> : null} {status}</Tag>

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

      if (cluster.status.components) {
        actions.push(
          <Popover placement="left" content={
            <Timeline
              pending={!status || status === 'Pending'}
              style={{
                marginTop: '25px',
                marginLeft: '10px',
                marginRight: '10px',
                marginBottom: status !== 'Pending' ? '-30px' : '0'
              }}>
              {cluster.status.components.map((c, idx) =>
                <Timeline.Item key={idx} color={statusColorMap[c.status] || 'red'}>
                  <Text strong>{c.status}: </Text><Text>{c.message}</Text>
                </Timeline.Item>
              )}
            </Timeline>
          }>
            {statusTag}
          </Popover>
        )
      } else {
        actions.push(statusTag)
      }
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
