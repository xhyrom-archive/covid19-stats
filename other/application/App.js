import { Component } from 'react';
import { WebView } from 'react-native-webview';

export default class Application extends Component {
  constructor() {
    super();
  }

  render() {
    return <WebView source={{ uri: "https://covid19.hyrousek.tk" }}></WebView>
  }
}