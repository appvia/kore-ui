import { AxiosResponse } from 'axios'
const axios = require('axios').default;

export async function sampleFetchWrapper(
  input: string
) {
  try {
    const result: AxiosResponse = await axios.get(input)
    return result.data
  } catch (err) {
    throw new Error(err.message)
  }
}
