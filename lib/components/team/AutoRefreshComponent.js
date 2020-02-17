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
    return this.FINAL_STATES.includes(this.state[this.stateResourceDataKey].status.status)
  }

  checkClearInterval() {
    if (this.isFinalState()) {
      this.showMessage && this.showMessage(this.state[this.stateResourceDataKey].status.status)
      clearInterval(this.interval)
    }
  }

  async fetchResource() {
    const resourceData = await apiRequest(null, 'get', this.resourceApiPath)
    return resourceData
  }

  componentDidMount() {
    if (!this.isFinalState()) {
      this.interval = setInterval(async () => {
        const resourceData = await this.fetchResource()
        const state = copy(this.state)
        state[this.stateResourceDataKey] = resourceData
        this.setState(state)
        this.checkClearInterval()
      }, this.refreshMs)
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

}

export default AutoRefreshComponent
