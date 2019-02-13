import React, {Component} from 'react';
import {FlatList, StyleSheet, Text, View, Button, RefreshControl,Image,
  ActivityIndicator, DeviceInfo, TextInput, Platform, TouchableOpacity,
} from 'react-native';
import {createMaterialTopTabNavigator, createAppContainer} from 'react-navigation'
import {connect} from 'react-redux'
import Toast from 'react-native-easy-toast'
import EventBus from 'react-native-event-bus'

import NavigationUtil from '../navigator/NavigationUtil'
import NavigationBar from '../common/NavigationBar'
import actions from '../action/index'
import PopularItem from '../common/PopularItem'
import FavoriteDao from '../expand/dao/FavoriteDao'
import {FLAG_STORAGE} from '../expand/dao/DataStore'
import LanguageDao, {FLAG_LANGUAGE} from '../expand/dao/LanguageDao'
import FavoriteUtil from '../util/FavoriteUtil'
import EventTypes from '../util/EventTypes'
import GlobalStyles from '../res/styles/GlobalStyles'
import ViewUtil from '../util/ViewUtil'
import Utils from '../util/Utils'

const pageSize = 10
const favoriteDao = new FavoriteDao(FLAG_STORAGE.flag_popular);
const languageDao = new LanguageDao(FLAG_LANGUAGE.flag_key);

type Props = {};
class SearchPage extends Component<Props> {
  constructor(props) {
    super(props);
    this.params = this.props.navigation.state.params;
    this.isKeyChange = false;
  }

  loadData(loadMore) {
    const {onLoadMoreSearch, onRefreshSearch, search, keys} = this.props
    if (loadMore) {
      onLoadMoreSearch(++search.pageIndex, pageSize, search.items, favoriteDao, callBack => {
        this.toast.show('no more')
      })
    } else {
      onRefreshSearch(this.inputKey, pageSize, this.searchToken = new Date().getTime(), favoriteDao, keys, message => {
        this.toast.show(message)
      })
    }
  }

  onBackPress() {
    const {onSearchCancel, onLoadLanguage} = this.props
    onSearchCancel()
    this.refs.input.blur()
    NavigationUtil.goBack(this.props.navigation)
    if (this.isKeyChange) {
      onLoadLanguage(FLAG_LANGUAGE.flag_key)
    }
  }

  renderItem(data) {
    const item = data.item
    const {theme} = this.params
    return <PopularItem
      projectModel={item}
      theme={theme}
      onSelect={(callBack) => {
        NavigationUtil.goPage({
          theme,
          projectModel: item,
          flag: FLAG_STORAGE.flag_popular,
          callBack
        }, 'DetailPage')
      }}
      onFavorite={(item, isFavorite) => FavoriteUtil.onFavorite(
        favoriteDao, item,
        isFavorite, FLAG_STORAGE.flag_popular)}
      />
  }

  getIndicator() {
    return this.props.search.hideLoadingMore ? null :
      <View style={styles.indicatorContainer}>
        <ActivityIndicator
          style={styles.indicator}
          />
        <Text>Loading More</Text>
      </View>
  }

  saveKey() {
    const {keys} = this.props
    let key = this.inputKey
    if (Utils.checkKeyIsExist(keys, key)) {
      this.toast.show(key + ' already exists')
    } else {
      key = {
        'path': key,
        'name': key,
        'checked': true
      }
      keys.unshift(key)
      languageDao.save(keys)
      this.toast.show(key.name + ' save successfully')
      this.isKeyChange = true
    }
  }
  onRightButtonClick() {
    const {onSearchCancel, search} = this.props
    if (search.showText === 'Search') {
      this.loadData()
    } else {
      onSearchCancel(this.searchToken)
    }
  }
  renderNavBar() {
    const {theme} = this.params
    const {showText, inputKey} = this.props.search
    const placeholder = inputKey || 'Please Enter'
    let backButton = ViewUtil.getLeftBackButton(() => this.onBackPress())
    let inputView = <TextInput
      ref='input'
      placeholder={placeholder}
      onChangeText={text => this.inputKey = text}
      style={styles.textInput}
      />
    let rightButton =
        <TouchableOpacity
            onPress={() => {
                this.refs.input.blur();//close keyboard
                this.onRightButtonClick();
            }}
        >
            <View style={{marginRight: 10}}>
                <Text style={styles.title}>{showText}</Text>
            </View>
        </TouchableOpacity>
      return <View style={{
          flexDirection: 'row',
          backgroundColor: theme.themeColor,
          alignItems: 'center',
          height: GlobalStyles.nav_bar_height_ios
        }}>
        {backButton}
        {inputView}
        {rightButton}
      </View>
  }
  render() {
    const {isLoading, projectModels, showBottomButton, hideLoadingMore} = this.props.search
    const {keys, theme} = this.params
    let statusBar = null
    if (Platform.OS === 'ios') {
      statusBar = <View style={[styles.statusBar, {backgroundColor: theme.themeColor}]}></View>
    }
    let listView = !isLoading ? <FlatList
      data={projectModels}
      renderItem={data => this.renderItem(data)}
      keyExtractor={item =>"" + item.item.id}
      contentInset={
        {
          bottom: 45
        }
      }
      refreshControl={
        <RefreshControl
          title={'Loading'}
          titleColor={theme.themeColor}
          colors={[theme.themeColor]}
          refreshing={isLoading}
          onRefresh={()=> this.loadData()}
          tintColor={theme.themeColor}
          />
      }
      ListFooterComponent={() => this.getIndicator()}
      onEndReached={() => {
                console.log('---onEndReached----');
                setTimeout(() => {
                    if (this.canLoadMore) {//fix 滚动时两次调用onEndReached https://github.com/facebook/react-native/issues/14015
                        this.loadData(true);
                        this.canLoadMore = false;
                    }
                }, 200);
            }}
            onEndReachedThreshold={0.5}
            onMomentumScrollBegin={() => {
                this.canLoadMore = true; //fix 初始化时页调用onEndReached的问题
                console.log('---onMomentumScrollBegin-----')
            }}
      /> : null
      let bottomButton = showBottomButton ?
      <TouchableOpacity
        style={[styles.bottomButton, {backgroundColor: this.params.theme.themeColor}]}
        onPress={() => this.saveKey()}
        >
        <View style={{justifyContent: 'center'}}>
          <Text style={styles.title}>Save this search key</Text>
        </View>
      </TouchableOpacity> : null
      let indicatorView = isLoading ?
        <ActivityIndicator
          style={styles.centering}
          size='large'
          animating={isLoading}
          /> : null
      let resultView = <View style={{flex: 1}}>
        {indicatorView}
        {listView}
      </View>
    return (
      <View style={styles.container}>
        {statusBar}
        {this.renderNavBar()}
        {resultView}
        {bottomButton}
        <Toast ref={toast => this.toast = toast}/>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  search: state.search,
  keys: state.language.keys
})

const mapDispatchToProps = dispatch => ({
  onRefreshSearch: (inputKey, pageSize, token, favoriteDao, popularKeys, callBack) => dispatch(actions.onRefreshSearch(inputKey, pageSize, token, favoriteDao, popularKeys, callBack)),
  onSearchCancel: (token) => dispatch(actions.onSearchCancel(token)),
  onLoadMoreSearch: (pageIndex, pageSize, dataArray, favoriteDao, callBack) => dispatch(actions.onLoadMoreSearch(pageIndex, pageSize, dataArray, favoriteDao, callBack)),
  onLoadLanguage: (flag) => dispatch(actions.onLoadLanguage(flag))
})
export default connect(mapStateToProps, mapDispatchToProps)(SearchPage)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabStyle: {
        // minWidth: 50 //fix minWidth会导致tabStyle初次加载时闪烁
        padding: 0
    },
    indicatorStyle: {
        height: 2,
        backgroundColor: 'white'
    },
    labelStyle: {
        fontSize: 13,
        margin: 0,
    },
    indicatorContainer: {
        alignItems: "center"
    },
    indicator: {
        color: 'red',
        margin: 10
    },
    statusBar: {
        height: 20
    },
    bottomButton: {
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.9,
        height: 40,
        position: 'absolute',
        left: 10,
        top: GlobalStyles.window_height - 45 - (DeviceInfo.isIPhoneX_deprecated ? 34 : 0),
        right: 10,
        borderRadius: 3
    },
    centering: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    textInput: {
        flex: 1,
        height: (Platform.OS === 'ios') ? 26 : 36,
        borderWidth: (Platform.OS === 'ios') ? 1 : 0,
        borderColor: "white",
        alignSelf: 'center',
        paddingLeft: 5,
        marginRight: 10,
        marginLeft: 5,
        borderRadius: 3,
        opacity: 0.7,
        color: 'white'
    },
    title: {
        fontSize: 18,
        color: "white",
        fontWeight: '500'
    },
});
