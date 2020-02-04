import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { Typography } from 'antd'
const { Title } = Typography

import Breadcrumb from '../../../../lib/components/Breadcrumb'
import ClusterBuildForm from '../../../../lib/components/forms/ClusterBuildForm'
import apiRequest from '../../../../lib/utils/api-request'

class NewTeamClusterPage extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    team: PropTypes.object.isRequired,
    clusters: PropTypes.object.isRequired,
    plans: PropTypes.object.isRequired,
    providers: PropTypes.array.isRequired
  }

  static async getPageData(req, name) {
    const getTeam = () => apiRequest(req, 'get', `/teams/${name}`)
    const getTeamClusters = () => apiRequest(req, 'get', `/teams/${name}/clusters`)
    const getPlans = () => apiRequest(req, 'get', '/plans')
    const getAvailable = () => apiRequest(req, 'get', `/teams/${name}/allocations?assigned=true`)

    return axios.all([getTeam(), getTeamClusters(), getPlans(), getAvailable()])
      .then(axios.spread(function (team, clusters, plans, available) {
        const providers = available.items.filter(a => a.spec.resource.kind === 'GKECredentials')
        return { team, clusters, plans, providers }
      }))
      .catch(err => {
        throw new Error(err.message)
      })
  }

  static getInitialProps = async (ctx) => {
    const data = await NewTeamClusterPage.getPageData(ctx.req, ctx.query.name)
    return {
      title: 'New cluster',
      ...data
    }
  }

  render() {
    const teamName = this.props.team.metadata.name
    const teamClusters = this.props.clusters.items

    return (
      <div>
        <Breadcrumb
          items={[
            { text: this.props.team.spec.summary, href: '/teams/[name]', link: `/teams/${teamName}` },
            { text: 'New cluster' }
          ]}
        />
        <Title>New Cluster for {this.props.team.spec.summary}</Title>
        <ClusterBuildForm
          user={this.props.user}
          team={this.props.team}
          plans={this.props.plans}
          providers={this.props.providers}
          teamClusters={teamClusters}
          skipButtonText="Cancel"
        />
      </div>
    )
  }
}

export default NewTeamClusterPage
