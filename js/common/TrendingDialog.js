import React, {Component} from 'react'
import {PropTypes} from 'prop-types'
import {Modal, ViewPropTypes, Text, StatusBar, StyleSheet, View, TouchableOpacity} from 'react-native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

import TimeSpan from '../model/TimeSpan'

export const TimeSpans = [
  new TimeSpan('today', 'since=daily'),
  new TimeSpan('this week', 'since=weekly'),
  new TimeSpan('this month', 'since=monthly')
]

export default class TrendingDialog extends Component {
  state = {
    visible: false
  }
  show() {
    this.setState({
      visible: true
    })
  }
  dismiss() {
    this.setState({
      visible: false
    })
  }
  render() {
    const {onClose, onSelect} = this.props
    return(
      <Modal
        transparent={true}
        visible={this.state.visible}
        onRequestClose={() => onClose}
        >
      <TouchableOpacity
        style={styles.container}
        onPress={() => this.dismiss()}
        >
        <MaterialIcons
          name={'arrow-drop-up'}
          size={36}
          style={styles.arrow}
          />
        <View
          style={styles.content}
          >
          {TimeSpans.map((result, i, arr) => {
            return <TouchableOpacity
              onPress={() => onSelect(arr[i])}
              underlayColor='transparent'
              >
              <View
                style={styles.text_container}
                >
                <Text
                  style={styles.text}
                  >{arr[i].showText}</Text>
                {
                  i != TimeSpans.length - 1 ? <View
                  style={styles.line}
                  /> : null
                }
              </View>
            </TouchableOpacity>
          })}
        </View>
      </TouchableOpacity>
      </Modal>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    flex: 1,
    alignItems: 'center'
  },
  arrow: {
    marginTop: 40,
    color: 'white',
    padding: 0,
    margin: -15
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 3,
    paddingTop: 3,
    paddingBottom: 3,
    paddingRight: 3
  }，
  text_container: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  text: {
    fontSize: 16,
    color: 'black',
    fontWeight: 400,
    padding: 8,
    paddingLeft: 26,
    paddingRight: 26
  },
  line: {
    height: 0.3,
    backgroundColor: 'darkGray'
  }
})
