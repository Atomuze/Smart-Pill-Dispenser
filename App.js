import React, { Component } from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  TextInput
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';

// var io = require("socket.io");
// var express = require("express");
// var app = express();
// app.use(express.static('www'));

class App extends Component {
  state = {
    medicine:"",
    count: 0,
    timeH:0,
    timeM:0
  }
  

  constructor(props){
    super(props);
    this.getData();
  }
  

  onPress = async () => {
    
    try{
      this.setState({
        medicine:"",
        count: 0,
        timeH:0,
        timeM:0
      });

      await AsyncStorage.setItem('medicine', JSON.stringify({medicine:this.state.medicine, count: this.state.count, timeH:this.state.timeH, timeM:this.state.timeM}));

    }catch(e){
      console.log(e);
    }
    this.getData();
  }

  getData = async () => {
    try{
      const medicineJSON = await AsyncStorage.getItem('medicine');
      const medicine = JSON.parse(medicineJSON);
      console.log("g")
      if(medicine != null){
        this.setState({...medicine});
      }
    }catch(e){
      console.log(e);
    }
  }

 render() {
  
    return (
      <View style={styles.container}>
        
        <Text>藥物名稱</Text>
        <TextInput 
          style={styles.input} 
          onChangeText={val => this.setState({medicine:val})} 
          value={this.state.medicine} />

        <Text>每次服用數量</Text>
        <TextInput 
          style={styles.input} 
          onChangeText={val => this.setState({count:val})} 
          value={this.state.count}
          keyboardType="numeric" />

        <Text>服用時間</Text>
        <Text>時:</Text>
        <TextInput 
          style={styles.input} 
          onChangeText={val => this.setState({timeH:val})} 
          value={this.state.timeH}
          keyboardType="numeric" />
        <Text>分:</Text>
        <TextInput 
          style={styles.input} 
          onChangeText={val => this.setState({timeM:val})} 
          value={this.state.timeM}
          keyboardType="numeric" />

        <TouchableOpacity style={styles.button} onPress={this.onPress}>
         <Text>btn</Text>
        </TouchableOpacity>

        
        
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    marginBottom: 10
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  }
})

export default App;




// var server = app.listen(5438, function(req, res) {
//   console.log("connecting to 5438 port");
// });

// var sio = io(server);

// sio.on('connection', function(socket){
//   console.log("Connected");

//   //get the messege from arduino
//   socket.on('connection', function (data) {
// 　　console.log('message:' + data.msg);
//   });

//   //get the time 
//   socket.on('atime', function (data) {
// 　　console.log('time message:' + data.msg);
//     socket.emit('atime', { 'time': new Date().toJSON() });
//   });
// });