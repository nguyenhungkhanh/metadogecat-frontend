import sample from 'lodash/sample'

export const nodes = [process.env.REACT_APP_NODE_1, process.env.REACT_APP_NODE_2, process.env.REACT_APP_NODE_3]

export default function getRpcUrl() {
  return sample(nodes)
}
