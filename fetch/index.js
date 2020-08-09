import { floatFormat, hashFormat, percent } from '../utils/index'
export async function fetchBlockInfo($axios, progress = true) {
  const { code, data: blockInfo } = await $axios.$get('/dashboard/network',{ progress }).catch(() => ({ code: -1 }))
  if (code === 0) {
    return blockInfo
  }
  return {}
}
export async function fetchTxHistory($axios) {
  const { code, data: { list } = { list: [] } } = await $axios.$get('/chain/transactionhistory').catch(() => ({ code: -1 }))
  if (code === 0) {
    return list
  }
  return []
}
export async function fetchHomeBlockList($axios, pageSize = 10, page = 1, progress = true) {
  let { code, data: { list } = { list: [] } } = await $axios.$get(`/chain/blocks?size=${pageSize}&page=${page}`, { progress }).catch(() => ({ code: -1 }))
  if (code !== 0) {
    list = []
  }
  list = list.map((item, index) => {
    const name = item.name ? item.name : item.entityAddress
    return {
      ...item,
      proposer: { text: name, link: `/validators/detail/${item.entityAddress}`, type: item.name ? 'link' : 'hash-link' },
      timestamp: { value: item.timestamp * 1000, type: 'time' },
      height: { text: item.height, link: `/blocks/${item.height}`, type: 'link' },
    }
  });
  return { list }
}
export async function fetchBlockList($axios, page = 1, size = 20, progress = true) {
  let { code, data: { list, totalSize } = { list: [] } } = await $axios.$get(`/chain/blocks`, {
    params: {
      page,
      size
    },
    progress
  }).catch(() => ({ code: -1 }))
  list = list.map((item, index) => {
    const name = item.name ? item.name : item.entityAddress
    return {
      ...item,
      hash: { text: item.hash, link: `/blocks/${item.height}`, sliceLength: 12, type: 'hash-link' },
      timestamp: { value: item.timestamp * 1000, type: 'time' },
      proposer: { text: name, link: `/validators/detail/${item.entityAddress}`, type: item.name ? 'link' : 'hash-link' },
      height: { text: item.height, link: `/blocks/${item.height}`, type: 'link' }
    }
  });
  return { list, totalSize }
}
export async function fetchChainMethods($axios) {
  let { code, data: { list } = { list: [] } } = await $axios.$get('/chain/methods', {
    progress: false,
    params: {
    }
  }).catch(() => ({ code: -1 }))
  if (code !== 0) {
    list = []
  }
  return { list }
}
export async function fetchAccountDetail($axios, address) {
  let { code, data = { } } = await $axios.$get(`/chain/account/info/${address}`, {
  }).catch(() => ({ code: -1 }))
  data.address = { address: data.address, total: data.total }
  return data
}
export async function fetchAccountDelegations($axios, address, page = 1, size = 5) {
  let { code, data: { list, totalSize } = { list: [] } } = await $axios.$get(`/chain/account/delegations`, {
    params: {
      address,
      page,
      size
    }
  }).catch(() => ({ code: -1 }))
  if (code !== 0) {
    list = []
  }
  const res = list.map((item) => {
    const name = item.validatorName ? item.validatorName : item.validatorAddress
    return {
      ...item,
      validatorName: { text: name, link: `/validators/detail/${item.validatorAddress}`, type: item.validatorName ? 'link' : 'hash-link' },
    }
  })
  return { list: res, totalSize }
}
export async function fetchAccountDebonding($axios, address, page = 1, size = 5) {
  let { code, data: { list, totalSize } = { list: [] } } = await $axios.$get(`/chain/account/debonding`, {
    params: {
      address,
      page,
      size
    }
  }).catch(() => ({ code: -1 }))
  if (code !== 0) {
    list = []
  }
  const res = list.map((item) => {
    const name = item.validatorName ? item.validatorName : item.validatorAddress
    return {
      ...item,
      validatorName: { text: name, link: `/validators/detail/${item.validatorAddress}`, type: item.validatorName ? 'link' : 'hash-link' },
    }
  })
  return { list: res, totalSize }
}
export async function fetchAccountsList($axios, page = 1, size = 10) {
  let { code, data: { list, totalSize } = { list: [] } } = await $axios.$get('/chain/account/list', {
    params: {
      page,
      size
    }
  }).catch(() => ({ code: -1 }))
  if (code !== 0) {
    list = []
  }
  const res = list.map((item) => {
    return {
      ...item,
      address: { text: item.address, link: `/accounts/detail/${item.address}`, type: 'link', total: item.total },
      id: item.address
    }
  })
  return { list: res, totalSize }
}

export async function fetchTransactionsList($axios, page = 1, size = 10, method = '', progress = true, sliceLength = 8) {
  let { code, data: { list, totalSize } = { list: [] } } = await $axios.$get('/chain/transactions', {
    params: {
      page,
      size,
      method
    },
    progress
  }).catch(() => ({ code: -1 }))
  if (code !== 0) {
    list = []
  }
  const res = list.map((item) => {
    return {
      ...item,
      hash: { text: item.hash, link: `/blocks/${item.height}`, type: 'hash-link' },
      height: { text: item.height, link: `/blocks/${item.height}`, type: 'link' },
      txHash: { text: item.txHash, link: `/transactions/${item.txHash}`, type: 'hash-link', sliceLength },
      timestamp: { value: item.timestamp * 1000, type: 'time' },
      type: `${item.method}`
    }
  })
  return { list: res, totalSize }
}

export async function fetchValidatorsList($axios, orderBy = '', sort = 'desc') {
  let orderParams = {}
  if (orderBy) {
    orderParams.orderBy = orderBy;
    orderParams.sort = sort;
  }
  let { code, data: { list, active, inactive, delegators } = {} } = await $axios.$get('/validator/list', {
    params: {
      ...orderParams
    }
  }).catch(() => ({ code: -1 }))
  if (code !== 0) {
    list = []
  }
  const res = list.map((item, index) => {
    return {
      ...item,
      escrow: { escrow: item.escrow, escrowPercent: item.escrowPercent },
      commission: { value: item.commission, type: 'percent' },
    }
  })
  res.forEach((item, index) => {
    const name = item.name ? item.name : item.entityAddress
    item.name = { text: name, icon: item.icon, link: `validators/detail/${encodeURIComponent(item.entityAddress)}`, type: item.name ? 'link' : 'hash-link' }
  })
  return { list: res, active, inactive, delegators }
}

export async function fetchBlockDetail($axios, hashOrBlockHeight) {
  let { code, data } = await $axios.$get(`/chain/block/${hashOrBlockHeight}`, {
    params: {
    }
  })
  if (code !== 0 || !data) {
    data = {}
  }
  const name = data.name ? data.name : item.entityAddress
  return {
    height: data.height,
    epoch: data.epoch,
    hash: data.hash,
    txs: data.txs,
    proposer: { text: name, link: `/validators/detail/${data.entityAddress}`, type: 'link' },
    timestamp: { value: data.timestamp * 1000, type: 'time' },
  }
}

/**
 * 搜索
 * @param key
 * @returns {Promise<void>}
 */
export async function search($axios, key) {
  let { code, data} = await $axios.$get('/chain/search', {
    params: {
      key
    },
    progress: false
  })
  return data
}

/**
 * 获取某一个块下的交易记录
 * @param $axios
 * @param blockHeight
 * @param page
 * @param pageSize
 * @param address
 * @param query_type
 * @returns {Promise<{total, list: *, totalRecordsCount}>}
 */
export async function fetchTransactions($axios, blockHeight = '', address = '', page = 1, pageSize = 10) {
  let { code, data: { list, totalSize } = { list: [] } } = await $axios.$get('chain/transactions', {
    params: {
      page,
      size: pageSize,
      height: blockHeight,
      address
    }
  });
  if (code !== 0) {
    list = []
  }
  const res = list.map((item) => {
    return {
      ...item,
      height: { text: item.height, link: `/blocks/${item.height}`, type: 'link' },
      txHash: { text: item.txHash, link: `/transactions/${item.txHash}`, type: 'hash-link' },
      timestamp: { value: item.timestamp * 1000, type: 'time' },
      type: `${item.method}`
    }
  });
  return { list: res, totalSize }
}

/**
 * 请求交易详情
 * @param $axios
 * @param txHash
 * @returns {Promise<void>}
 */
export async function fetchTransactionDetail($axios, txHash) {
  let { code, data } = await $axios.$get(`/chain/transaction/${txHash}`, {
    params: {
    }
  })
  if (code !== 0) {
    data = {}
  }
  console.log('data', data)
  return {
    txHash: data.txHash,
    method: data.method,
    from: { text: data.from, link: `/accounts/detail/${data.from}`, type: 'link' },
    to: { text: data.to, link: `/accounts/detail/${data.to}`, type: 'link' },
    amount: data.amount,
    raw: data.raw,
    status: !!data.status,
    timestamp: data.timestamp,
    height: { text: data.height, link: `/blocks/${data.height}`, type: 'link' },
    fee: data.fee,
    nonce: data.nonce
  }
}

export async function getEventsByProposer($axios, address, size = 5, page = 1) {
  let { code, data: { list, totalSize } = { list: [] } } = await $axios.$get(`/chain/powerevent`, {
    params: {
      address: address,
      page,
      size
    }
  });
  return {
    list: list.map((item) => {
      return {
        ...item,
        height: { text: item.height, link: `/blocks/${item.height}`, type: 'link' },
        txHash: { text: item.txHash, link: `/transactions/${item.txHash}`, type: 'hash-link' },
        timestamp: { value: item.timestamp * 1000, type: 'time' },
        amountAndShares: { value: `${item.amount}/${item.shares}`, add: item.add }
      }
    }),
    totalSize
  }
}

export async function validatorStats($axios, address) {
  let { code, data: { signs, proposals } = { signs: [], proposals: [] } } = await $axios.$get(`/validator/stats`, {
    params: {
      address
    },
    progress: false
  })
  return {
    signs, proposals
  }
}
export async function getDelegatorsByProposer($axios, address, size = 5, page = 1) {
  let { code, data: { list, totalSize } = { list: [] } } = await $axios.$get(`/validator/delegators`, {
    params: {
      address,
      page,
      size
    }
  });
  return {
    list: list.map((item) => {
      return {
        ...item,
        address: { text: item.address, type: 'hash-link', link: `/accounts/detail/${item.address}` },
        percent: { value: item.percent, type: 'percent' },
        amountAndShares: `${item.amount}/${item.shares}`
      }
    }),
    totalSize
  }
}

export async function getBlockByProposer($axios, address, size = 5, page = 1) {
  let { code, data: { list, totalSize } = { list: [] } } = await $axios.$get(`/chain/getBlockByProposer`, {
    params: {
      address,
      page,
      size
    }
  });
  console.log('totalSize', totalSize)
  return {
    list: list.map((item) => {
      return {
        ...item,
        height: { text: item.height, link: `/blocks/${item.height}`, type: 'link' },
        hash: { text: item.hash, link: `/blocks/${item.height}`, type: 'hash-link', sliceLength: 12 },
        timestamp: { value: item.timestamp * 1000, type: 'time' },
        type: `${item.method}`
      }
    }),
    totalSize
  }
}

/**
 * 验证人trend统计
 * @param $axios
 * @param address
 * @returns {Promise<void>}
 */
export async function fetchEscrowTrendByAddress($axios, address) {
  let { code, data: { list } = { list: [] } } = await $axios.$get(`/validator/escrowstats`, {
    params: {
      address
    }
  })
  if (code !== 0) {
    return {
      list: []
    }
  } else {
    return {
      list
    }
  }
}
export async function fetchValidatorDetail($axios, address) {
  let { code, data, ...others } = await $axios.$get(`/validator/info`, {
    params: {
      address
    }
  })
  if (code !== 0) {
    console.log('others', others, code)
    return {
      entityId: '',
      name: '',
      icon: null,
      website: null,
      escrow: '',
      balance: '',
      totalShares: '',
      signs: 0,
      proposals: 0,
      nonce: 0,
      score: 0,
      nodes: [''],
      uptime: '',
      active: false
    }
  } else {
    console.log('data', data)
    return data
  }
}
export async function onSearch(vue, text) {
  const searchText = text.trim()
  vue.$Spin.show()
  try {
    const res = await search(vue.$axios, searchText)
    if (res) {
      switch (res.type) {
        case 'validator':
          vue.$router.push(`/validators/detail/${res.result}`)
          break
        case 'transaction':
          vue.$router.push(`/transactions/${res.result}`)
          break
        case 'account':
          vue.$router.push(`/accounts/detail/${res.result}`)
          break
        case 'block':
          vue.$router.push(`/blocks/${res.result}`)
          break
        default:
          vue.$Spin.hide()
          vue.$router.push(`/not_found`)
          break
      }
    }
  } catch (e) {
    vue.$Spin.hide()
    vue.$router.push(`/not_found`)
  }
  setTimeout(() => {
    vue.$Spin.hide()
  }, 1000)
}

export async function fetchAddressDetail($axios, address) {
  let { code, data: { list } = { list: [] } } = await $axios.$get('/alief/address/info', {
    params: {
      address: address
    }
  })
  if (code !== 0) {
    data = {}
  }
  return {
    balance: data.balance
  }
}
