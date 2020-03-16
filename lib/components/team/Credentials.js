import PropTypes from 'prop-types'
import moment from 'moment'
import { List, Avatar, Icon, Typography, message, Tooltip } from 'antd'
const { Text } = Typography

import ResourceVerificationStatus from '../ResourceVerificationStatus'
import AutoRefreshComponent from './AutoRefreshComponent'

class Credentials extends AutoRefreshComponent {
  static propTypes = {
    gke: PropTypes.object.isRequired,
    allTeams: PropTypes.array.isRequired,
    editGKECredential: PropTypes.func.isRequired
  }

  componentDidUpdate(prevProps) {
    const prevStatus = prevProps.gke.status && prevProps.gke.status.status
    const newStatus = this.props.gke.status && this.props.gke.status.status
    if (prevStatus !== newStatus) {
      this.startRefreshing()
    }
  }

  finalStateReached() {
    const { gke } = this.props
    const { allocation, status } = gke
    if (status.status === 'Success') {
      return message.success(`GKE credentials "${allocation.spec.name}" verified successfully`)
    }
    if (status.status === 'Failure') {
      return message.error(`GKE credentials "${allocation.spec.name}" could not be verified`)
    }
  }

  render() {
    const { gke, editGKECredential, allTeams } = this.props

    const created = moment(gke.metadata.creationTimestamp).fromNow()

    const getCredentialsAllocations = allocation => {
      if (!allocation) {
        return <Text>No teams <Tooltip title="These credentials are not allocated to any teams, click edit to fix this."><Icon type="warning" theme="twoTone" twoToneColor="orange" /></Tooltip> </Text>
      }
      const allocatedTeams = allTeams.filter(team => allocation.spec.teams.includes(team.metadata.name)).map(team => team.spec.summary)
      return allocatedTeams.length > 0 ? allocatedTeams.join(', ') : 'All teams'
    }

    const displayName = gke.allocation ? (
      <Text>{gke.allocation.spec.name} <Text type="secondary">{gke.allocation.spec.summary}</Text></Text>
    ): (
      <Text>{gke.metadata.name}</Text>
    )
    return (
      <List.Item key={gke.metadata.name} actions={[
        <ResourceVerificationStatus key="verification_status" resourceStatus={gke.status} />,
        <Text key="show_creds"><a onClick={editGKECredential(gke)}><Icon type="eye" theme="filled"/> Edit</a></Text>
      ]}>
        <List.Item.Meta
          avatar={<Avatar icon="cloud" />}
          title={displayName}
          description={
            <div>
              <Text>Allocated to: {getCredentialsAllocations(gke.allocation)}</Text>
              <br/>
              <Text type='secondary'>Created {created}</Text>
            </div>
          }
        />
      </List.Item>
    )
  }

}

export default Credentials
