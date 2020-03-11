import * as React from 'react'
import apiRequest from '../../utils/api-request'
import copy from '../../utils/object-copy'

/*
 Properties that must be set on the parent
   - refreshMs - how often to refresh the state
   - stateResourceDataKey - where is the data located in the state object
   - resourceApiPath - API path for requesting updated resource data
 */

class AutoRefreshComponent extends React.Component {

  FINAL_STATES = ['Success', 'Failure']

  isFinalState() {
    const status = this.state[this.stateResourceDataKey].status && this.state[this.stateResourceDataKey].status.status
    return this.FINAL_STATES.includes(status)
  }

  isDeleted() {
    return this.state[this.stateResourceDataKey].deleted
  }

  checkClearInterval() {
    if (this.isDeleted() || this.isFinalState()) {
      const status = this.state[this.stateResourceDataKey].status ? this.state[this.stateResourceDataKey].status.status : 'Deleted'
      this.finalStateReached && this.finalStateReached(status)
      clearInterval(this.interval)
    }
  }

  async fetchResource() {
    const resourceData = await apiRequest(null, 'get', this.resourceApiPath)
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
        state[this.stateResourceDataKey] = resourceData
        this.setState(state)
        this.checkClearInterval()
      }, this.refreshMs)
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
