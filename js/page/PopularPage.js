/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {FlatList, StyleSheet, Text, View, Button, RefreshControl,Image, ActivityIndicator} from 'react-native';
import {createMaterialTopTabNavigator, createAppContainer} from 'react-navigation'
import {connect} from 'react-redux'
import Toast from 'react-native-easy-toast'
import NavigationUtil from '../navigator/NavigationUtil'
import actions from '../action/index'
import PopularItem from '../common/PopularItem'

const URL = 'https://api.github.com/search/repositories?q='
const QUERY_STR = '&sort=stars'
const THEME_COLOR = 'red'

type Props = {};
export default class PopularPage extends Component<Props> {
  constructor(props) {
    super(props)
    this.tabNames = ['Java', 'Android', 'iOS', 'React', 'React Native', 'PHP']
  }

  _genTabs() {
    const tabs = {}
    this.tabNames.forEach((item, index) => {
      tabs[`tab${index}`] = {
        screen: props => <PopularTabPage {...props} tabLabel={item}/>,
        navigationOptions: {
          title: item
        }
      }
    })
    return tabs
  }

  render() {
    const TabNavigator = createAppContainer(createMaterialTopTabNavigator(
      this._genTabs(), {
        tabBarOptions: {
          tabStyle: styles.tabStyle,
          upperCaseLabel: false,
          scrollEnabled: true,
          style: {
            backgroundColor: '#678'
          },
          indicatorStyle: styles.indicatorStyle,
          labelStyle: styles.labelStyle
        }
      }
    ))
    return (
      <View style={{flex: 1, marginTop: 30}}>
        <TabNavigator/>
      </View>
    );
  }
}

const pageSize = 10

class PopularTab extends Component<Props> {
  constructor(props) {
    super(props)
    const {tabLabel} = this.props
    this.storeName = tabLabel
  }

  componentDidMount() {
    this.loadData()
  }

  loadData(loadMore) {
    const {onLoadPopularData, onLoadMorePopular} = this.props
    const url = this.genFetchUrl(this.storeName)
    const store = this._store()
    if (loadMore) {
      console.log('loadmore called')
      onLoadMorePopular(this.storeName, ++store.pageIndex, pageSize, store.items, callBack => {
        this.refs.toast.show('no more')
      })
    } else {
      onLoadPopularData(this.storeName, url, pageSize)
    }

  }

  genFetchUrl(key) {
    return URL + key + QUERY_STR
  }

  renderItem(data) {
    const item = data.item
    return <PopularItem
      item={item}
      onSelect={() => {}}
      />
  }

  _store() {
    const { popular } = this.props
    let store = popular[this.storeName]
    if (!store) {
      store = {
        items: [],
        isLoading: false,
        projectModes: [],
        hideLoadingMore: true,
      }
    }
    return store
  }

  getIndicator() {
    return this._store().hideLoadingMore ? null :
      <View style={styles.indicatorContainer}>
        <ActivityIndicator
          style={styles.indicator}
          />
        <Text>Loading More</Text>
      </View>
  }

  render() {
    const { popular } = this.props
    let store = this._store()
    return (
      <View style={styles.container}>
        <FlatList
          data={store.projectModes}
          renderItem={data => this.renderItem(data)}
          keyExtractor={item =>"" + item.id}
          refreshControl={
            <RefreshControl
              title={'Loading'}
              titleColor={THEME_COLOR}
              colors={[THEME_COLOR]}
              refreshing={store.isLoading}
              onRefresh={()=> this.loadData()}
              tintColor={THEME_COLOR}
              />
          }
          ListFooterComponent={() => this.getIndicator()}
          onEndReached={() => {
            setTimeout(() => {
              if (this.canLoadMore) {
                this.loadData(true)
                this.canLoadMore = false
              }
            }, 100)
          }}
          onEndReachedThreshold={0.5}
          onMomentumScrollBegin={() => {
            this.canLoadMore = true
          }}
          />
        <Toast
          ref={'toast'}
          position={'center'}
          />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
    popular: state.popular
  })

const mapDispatchToProps = (dispatch) => ({
    onLoadPopularData: (storeName, url, pageSize) => dispatch(actions.onLoadPopularData(storeName, url, pageSize)),
    onLoadMorePopular: (storeName, pageIndex, pageSize, projectModes, callBack) => dispatch(actions.onLoadMorePopular(
      storeName, pageIndex, pageSize, projectModes, callBack
    ))
})

const PopularTabPage = connect(mapStateToProps, mapDispatchToProps)(PopularTab)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  tabStyle: {
    minWidth: 50
  },
  indicatorStyle: {
    height: 2,
    backgroundColor: 'white'
  },
  labelStyle: {
    fontSize: 13,
    marginTop: 6,
    marginBottom: 6
  },
  indicatorContainer: {
    alignItems: 'center'
  },
  indicator: {
    color: 'red',
    margin: 10
  }
});
