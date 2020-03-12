import * as React from 'react'
import PropTypes from 'prop-types'
import apiRequest from '../../utils/api-request'
import copy from '../../utils/object-copy'

/*
 Props that must be passed to the parent
   - refreshMs - how often to refresh the state
   - stateResourceDataKey - where is the data located in the state object
   - resourceApiPath - API path for requesting updated resource data
 */

class AutoRefreshComponent extends React.Component {

  static propTypes = {
    refreshMs: PropTypes.number.isRequired,
    stateResourceDataKey: PropTypes.string.isRequired,
    resourceApiPath: PropTypes.string.isRequired
  }

  FINAL_STATES = ['Success', 'Failure']

  isFinalState() {
    const stateResource = this.state[this.props.stateResourceDataKey]
    const status = stateResource.status && stateResource.status.status
    return this.FINAL_STATES.includes(status)
  }

  isDeleted() {
    return this.state[this.props.stateResourceDataKey].deleted
  }

  checkClearInterval() {
    const isDeleted = this.isDeleted()
    if (isDeleted || this.isFinalState()) {
      const stateResource = this.state[this.props.stateResourceDataKey]
      const status = isDeleted ? 'Deleted' : (stateResource.status && stateResource.status.status)
      this.finalStateReached && this.finalStateReached(status)
      clearInterval(this.interval)
    }
  }

  async fetchResource() {
    const resourceData = await apiRequest(null, 'get', this.props.resourceApiPath)
    return resourceData
  }

  startRefreshing() {
    if (!this.isFinalState() && !this.isDeleted()) {
      this.interval = setInterval(async () => {
        const resourceData = await this.fetchResource()
        if (Object.keys(resourceData).length === 0) {
          resourceData.deleted = true
        }
        const state = copy(this.state)
        state[this.props.stateResourceDataKey] = resourceData
        this.setState(state, this.checkClearInterval)
      }, this.props.refreshMs)
    }
  }

  componentDidMount() {
    this.startRefreshing()
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

}

export default AutoRefreshComponent
