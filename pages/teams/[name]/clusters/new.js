import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { Typography } from 'antd'
const { Title } = Typography

import Breadcrumb from '../../../../lib/components/Breadcrumb'
import ClusterBuildForm from '../../../../lib/components/forms/ClusterBuildForm'
import apiRequest from '../../../../lib/utils/api-request'
import apiPaths from '../../../../lib/utils/api-paths'

class NewTeamClusterPage extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    team: PropTypes.object.isRequired,
    clusters: PropTypes.object.isRequired
  }

  static staticProps = {
    title: 'New team cluster'
  }

  static async getPageData({ req, res, query }) {
    const name = query.name
    const getTeam = () => apiRequest({ req, res }, 'get', apiPaths.team(name).self)
    const getTeamClusters = () => apiRequest({ req, res }, 'get', apiPaths.team(name).clusters)

    return axios.all([getTeam(), getTeamClusters()])
      .then(axios.spread(function (team, clusters) {
        return { team, clusters }
      }))
      .catch(err => {
        throw new Error(err.message)
      })
  }

  static getInitialProps = async (ctx) => {
    const data = await NewTeamClusterPage.getPageData(ctx)
    return data
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
          teamClusters={teamClusters}
          skipButtonText="Cancel"
        />
      </div>
    )
  }
}

export default NewTeamClusterPage
