import Types from '../types'
import DataStore, {FLAG_STORAGE} from '../../expand/dao/DataStore'
import {handleData, _projectModels} from '../ActionUtil'
import FavoriteDao from '../../expand/dao/FavoriteDao'

export function onRefreshPopular(storeName, url, pageSize, favoriteDao) {
  return dispatch => {
    dispatch({
      type: Types.POPULAR_REFRESH,
      storeName: storeName
    })
    let dataStore = new DataStore()
    dataStore.fetchData(url, FLAG_STORAGE.flag_popular) // async action and data flow
        .then(data => {
          handleData(Types.POPULAR_REFRESH_SUCCESS, dispatch, storeName, data, pageSize,
          favoriteDao)
        })
        .catch(error => {
          console.log(error)
          dispatch({
            type: Types.POPULAR_REFRESH_FAIL,
            storeName,
            error
          })
        })
  }
}

export function onLoadMorePopular(storeName, pageIndex, pageSize, dataArray = [], favoriteDao, callBack) {
  return dispatch => {
    setTimeout(() => {
      if ((pageIndex - 1) * pageSize >= dataArray.length) {//already load all data
        if (typeof(callBack) === 'function') {
          callBack('no more')
        }
        dispatch({
          type: Types.LOAD_POPULAR_MORE_FAIL,
          error: 'no more',
          storeName: storeName,
          pageIndex: --pageIndex,
        })
      } else {
        let max = pageSize * pageIndex > dataArray.length ? dataArray.length : pageSize * pageIndex
        _projectModels(dataArray.slice(0, max), favoriteDao, data => {
          dispatch({
            type: Types.LOAD_POPULAR_MORE_SUCCESS,
            storeName,
            pageIndex,
            projectModels: data
          })
        })

      }
    }, 1000)
  }
}

export function onFlushPopularFavorite(storeName, pageIndex, pageSize, dataArray = [], favoriteDao) {
  return dispatch => {
    let max = pageSize * pageIndex > dataArray.length ? dataArray.length : pageSize * pageIndex
    _projectModels(dataArray.slice(0, max), favoriteDao, data => {
      dispatch({
        type: Types.FLUSH_POPULAR_FAVORITE,
        storeName,
        pageIndex,
        projectModels: data
      })
    })
  }
}
