import React from 'react'
import axios from 'axios'
import { Typography } from 'antd'
const { Title } = Typography

import Breadcrumb from '../../../../lib/components/Breadcrumb'
import ClusterBuildForm from '../../../../lib/components/forms/ClusterBuildForm'
import apiRequest from '../../../../lib/utils/api-request'

class NewTeamClusterPage extends React.Component {

  static async getPageData(req, name) {
    const getTeam = () => apiRequest(req, 'get', `/teams/${name}`)
    const getTeamResources = () => apiRequest(req, 'get', `/teams/${name}/resources`)
    const getPlans = () => apiRequest(req, 'get', '/plans')
    const getAvailable = () => apiRequest(req, 'get', `/teams/${name}/available`)

    return axios.all([getTeam(), getTeamResources(), getPlans(), getAvailable()])
      .then(axios.spread(function (team, resources, plans, available) {
        const providers = available.items.filter(a => a.spec.category === 'cluster')
        return { team, resources, plans, providers }
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
    const teamClusters = this.props.resources.items.filter(r => r.kind === 'Kubernetes')

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
