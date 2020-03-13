import * as React from 'react'
import PropTypes from 'prop-types'
import apiRequest from '../../utils/api-request'

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
    resourceApiPath: PropTypes.string.isRequired,
    handleUpdate: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired
  }

  FINAL_STATES = ['Success', 'Failure']

  isFinalState() {
    const stateResource = this.props[this.props.stateResourceDataKey]
    const status = stateResource.status && stateResource.status.status
    return this.FINAL_STATES.includes(status)
  }

  isDeleted() {
    return this.props[this.props.stateResourceDataKey].deleted
  }

  checkClearInterval() {
    if (this.isDeleted() || this.isFinalState()) {
      this.finalStateReached && this.finalStateReached()
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
        const resourceName = this.props[this.props.stateResourceDataKey].metadata.name
        const resourceData = await this.fetchResource()
        if (Object.keys(resourceData).length === 0) {
          resourceData.deleted = true
          this.props.handleDelete(resourceName, () => this.checkClearInterval())
        } else {
          this.props.handleUpdate(resourceData, () => this.checkClearInterval())
        }
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
