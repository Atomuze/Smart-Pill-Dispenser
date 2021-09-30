import React, { Component, useState } from 'react'
import {
  Alert, Modal,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Pressable,
  TextInput
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNEsp32Idf,{useProvisioning} from "react-native-esp32-idf";

var medicineNumStr = "medicine1";

class App extends Component {
  state = {
    modalVisible:false,
    medicine:"",
    count:0,
    timeH:0,
    timeM:0
  }
  
  constructor(props){
    super(props);
    this.connectToEspDevice();
  }
  
  connectToEspDevice = async() => {
    try{
        const result = await RNEsp32Idf.connectWifiDevice("pop"); //proof of possession
        console.log(result);
    }
    catch(err){
        console.log(err)
  
    }
  }

  onPress = async () => {
    try{
      await AsyncStorage.setItem(medicineNumStr, JSON.stringify({medicine:this.state.medicine, count: this.state.count, timeH:this.state.timeH, timeM:this.state.timeM}));
      
    }catch(e){
      console.log(e);
    }
    this.getData();
  }

  getData = async () => {
    try{
      const medicineJSON = await AsyncStorage.getItem(medicineNumStr);
      const medicine = JSON.parse(medicineJSON);
      
      console.log(medicineNumStr);
      console.log(medicineJSON);

      if(medicine != null){
        this.setState({...medicine});
      }
    }catch(e){
      console.log(e);
    }
  }

 render() {
  
    return (
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            this.setState({modalVisible:!this.state.modalVisible})
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text>藥物名稱</Text>
              <TextInput 
                style={styles.input} 
                onChangeText={val => this.setState({medicine:val})} 
                value={this.state.medicine} />

              <Text>每次服用數量</Text>
              <TextInput 
                style={styles.input} 
                onChangeText={val2 => this.setState({count:val2})} 
                value={this.state.count.toString()}
                keyboardType="numeric" />

              <Text>服用時間</Text>
              <Text>時:</Text>
              <TextInput 
                style={styles.input} 
                onChangeText={val => this.setState({timeH:val})} 
                value={this.state.timeH.toString()}
                keyboardType="numeric" />
              <Text>分:</Text>
              <TextInput 
                style={styles.input} 
                onChangeText={val => this.setState({timeM:val})} 
                value={this.state.timeM.toString()}
                keyboardType="numeric" />

              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => {this.setState({modalVisible:!this.state.modalVisible});
                                this.onPress(); }}
              >
                <Text style={styles.textStyle}>save</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Pressable
          style={[styles.button, styles.buttonOpen]}
          onPress={() => {this.setState({modalVisible:true})
                    medicineNumStr = "medicine1";
                    this.getData() }}  
        >
          <Text style={styles.textStyle}>Slot 1</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonOpen]}
          onPress={() => {this.setState({modalVisible:true})
                    medicineNumStr = "medicine2";
                    this.getData()}}  
        >
          <Text style={styles.textStyle}>Slot 2</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonOpen]}
          onPress={() => {this.setState({modalVisible:true})
                    medicineNumStr = "medicine3";
                    this.getData()}}  
        >
          <Text style={styles.textStyle}>Slot 3</Text>
        </Pressable>
        
        <Pressable
          style={[styles.button, styles.buttonOpen]}
          onPress={() => {this.setState({modalVisible:true})
                    medicineNumStr = "medicine4";
                    this.getData()}}  
        >
          <Text style={styles.textStyle}>Slot 4</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonOpen]}
          onPress={() => {this.setState({modalVisible:true})
                    medicineNumStr = "medicine5";
                    this.getData()}}  
        >
          <Text style={styles.textStyle}>Slot 5</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonOpen]}
          onPress={() => {this.setState({modalVisible:true})
                    medicineNumStr = "medicine6";
                    this.getData()}}  
        >
          <Text style={styles.textStyle}>Slot 6</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonOpen]}
          onPress={() => {this.setState({modalVisible:true})
                    medicineNumStr = "medicine7";
                    this.getData()}}  
        >
          <Text style={styles.textStyle}>Slot 7</Text>
        </Pressable>

      </View>
    )
  }
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 20,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  input: {
    height: 40,
    width: 100,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  }
});




export default App;



