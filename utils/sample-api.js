const axios = require('axios').default;

async function sampleFetchWrapper(
  input
) {
  try {
    const result = await axios.get(input)
    return result.data
  } catch (err) {
    throw new Error(err.message)
  }
}

module.exports = { sampleFetchWrapper }
