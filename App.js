import React, { useState, useEffect, useRef } from 'react';
import {
	ActivityIndicator,
	Button,
	Clipboard,
	FlatList,
	Image,
	Share,
	StyleSheet,
	Text,
	View
} from 'react-native';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import Environment from './config/environment';
import firebase from './config/firebase';
import { getStorage, ref , uploadBytes, getDownloadURL  } from "firebase/storage";
// import * as Notify from './notify';
// import Notif from './notify';

import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default class App extends React.Component {
 	state = {
		image: null,
		uploading: false,
		googleResponse: null,
		expoPushToken:'',
		notification:false,
		notificationListener:null,
		responseListener:null,
		message:"123"
	};

	constructor(){
		super();
		this.state.notificationListener = React.createRef();
		this.state.responseListener = React.createRef();
		
		// async () => {await sendPushNotification(expoPushToken);}
	}


	async componentDidMount() {
		try{
			registerForPushNotificationsAsync().then(token => this.state.expoPushToken = token);
	  
			// This listener is fired whenever a notification is received while the app is foregrounded
			this.state.notificationListener.current = Notifications.addNotificationReceivedListener(notification => this.state.notification = notification);
		
			// This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
			this.state.responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
			  console.log(response);
			});
		
			return () => {
			  Notifications.removeNotificationSubscription(this.state.notificationListener.current);
			  Notifications.removeNotificationSubscription(this.state.responseListener.current);
			};
			//await Permissions.askAsync(Permissions.CAMERA_ROLL);
			//await Permissions.askAsync(Permissions.CAMERA);
		}catch(e){
			console.log(e)
		}
	}

	render() {
		let { image } = this.state;
		return (
			<View style={styles.container}>
					<View style={styles.getStartedContainer}>
						{image ? null : (
							<Text style={styles.getStartedText}>智慧藥盒</Text>
						)}
					</View>

					<View style={styles.helpContainer}>
						<Button
							onPress={this._pickImage}
							title="從圖片庫中選擇藥袋照片"
						/>
							
						<Button onPress={this._takePhoto} title="拍攝藥袋照片" />

						{this.state.googleResponse && (
							<FlatList
								data={this.state.googleResponse.responses[0].labelAnnotations}
								extraData={this.state}
								keyExtractor={this._keyExtractor}
								renderItem={({ item }) => <Text>Item: {item.description}</Text>}
							/>
						)}
						{this._maybeRenderImage()}
						{this._maybeRenderUploadingOverlay()}
					</View>
			</View>
		);
	}

	organize = array => {
		return array.map(function(item, i) {
			return (
				<View key={i}>
					<Text>{item}</Text>
				</View>
			);
		});
	};

	_maybeRenderUploadingOverlay = () => {
		if (this.state.uploading) {
			return (
				<View
					style={[
						StyleSheet.absoluteFill,
						{
							backgroundColor: 'rgba(0,0,0,0.4)',
							alignItems: 'center',
							justifyContent: 'center'
						}
					]}
				>
					<ActivityIndicator color="#fff" animating size="large" />
				</View>
			);
		}
	};

	_maybeRenderImage = () => {
		let { image, googleResponse } = this.state;
		if (!image) {
			return;
		}

		return (
			<View
				style={{
					marginTop: 20,
					width: 250,
					borderRadius: 3,
					elevation: 2
				}}
			>
				<Button
					style={{ marginBottom: 10 }}
					onPress={() => this.submitToGoogle()}
					title="按此分析藥袋照片"
				/>

				<View
					style={{
						borderTopRightRadius: 3,
						borderTopLeftRadius: 3,
						shadowColor: 'rgba(0,0,0,1)',
						shadowOpacity: 0.2,
						shadowOffset: { width: 4, height: 4 },
						shadowRadius: 5,
						overflow: 'hidden'
					}}
				>
					<Image source={{ uri: image }} style={{ width: 250, height: 250 }} />
				</View>
				<Text
					onPress={this._copyToClipboard}
					onLongPress={this._share}
					style={{ paddingVertical: 10, paddingHorizontal: 10 }}
				/>

				{googleResponse && (
					
					<Text
						onPress={this._copyToClipboard}
						onLongPress={this._share}
						style={styles.getGeneralText}
					>
						{this.state.message = this.getInfo(JSON.stringify(googleResponse.responses))}
						{this.setnotitime(this.state.message)}
						{this.state.message}
					</Text>
				)}
			</View>
		);
	};

	setnotitime = (mes) =>{
		let h;
		let m;
		console.log("setnotitime")
		if(mes.indexOf("三餐飯後") != -1){
			h = [8, 13, 0];
			m = [30, 0, 37];
		}else if(mes.indexOf("早晚飯後")!= -1){
			h = [0, 0];
			m = [31, 32];
		}else if(mes.indexOf("三餐飯前") != -1){
			h = [8, 12, 18];
			m = [0, 0, 0];
		}else if(mes.indexOf("早晚飯前")!= -1){
			h = [8, 18];
			m = [0, 0];
		}else {
			h = [0];
			m = [0];
		}
		
		for(let i=0 ; i<h.length; i++){
			schedulePushNotification(this.state.message, h[i], m[i]);
			console.log("set the notification time to " + h[i] + ":"+  m[i]);
		}
	}
	
	getInfo = respo => {
		let text1 = "";
		let text2 = "";
		let text3 = "";

		let namef = respo.indexOf("藥名");
		let namel = respo.indexOf("\\n",namef);
		if(namef != -1){
			text1 = "藥名：" + respo.substring(namef+3,namel);
		}else{
			text1 = "藥名：找無藥名";
		}

		let usef = respo.indexOf("每次");
		if(usef != -1){
			text2 = "每次" + respo.substring(usef+2,usef+3) + "顆";
		}else{
			text2 = "找無服藥次數";
		}

		if(respo.indexOf("三餐飯後") != -1){
			text3 = "三餐飯後";
		}else if(respo.indexOf("早晚飯後")!= -1){
			text3 = "早晚飯後";
		}else if(respo.indexOf("三餐飯前") != -1){
			text3 = "三餐飯前";
		}else if(respo.indexOf("早晚飯前")!= -1){
			text3 = "早晚飯前";
		}else {
			text3 = "無服藥時間";
		}
		return text1 + "\n" + text2 + "\n" + text3;

	}

	_keyExtractor = (item, index) => item.id;

	_renderItem = item => {
		<Text>response: {JSON.stringify(item)}</Text>;
	};

	_share = () => {
		Share.share({
			message: JSON.stringify(this.state.googleResponse.responses),
			title: 'Check it out',
			url: this.state.image
		});
	};

	_copyToClipboard = () => {
		Clipboard.setString(this.state.image);
		alert('Copied to clipboard');
	};

	_takePhoto = async () => {
		let pickerResult = await ImagePicker.launchCameraAsync({
			allowsEditing: true,
			aspect: [4, 3]
		});

		this._handleImagePicked(pickerResult);
	};

	_pickImage = async () => {
		let pickerResult = await ImagePicker.launchImageLibraryAsync({
			allowsEditing: true,
			aspect: [4, 3]
		});

		this._handleImagePicked(pickerResult);
	};

	_handleImagePicked = async pickerResult => {
		try {
			this.setState({ uploading: true });

			if (!pickerResult.cancelled) {
				let uploadUrl = await uploadImageAsync(pickerResult.uri);
				this.setState({ image: uploadUrl });
			}
		} catch (e) {
			console.log(e);
			alert('Upload failed, sorry :(');
		} finally {
			this.setState({ uploading: false });
		}
	};

	submitToGoogle = async () => {
		try {
			this.setState({ uploading: true });
			let { image } = this.state;
			let body = JSON.stringify({
				requests: [
					{
						features: [
							// { type: 'LABEL_DETECTION', maxResults: 10 },
							// { type: 'LANDMARK_DETECTION', maxResults: 5 },
							// { type: 'FACE_DETECTION', maxResults: 5 },
							// { type: 'LOGO_DETECTION', maxResults: 5 },
							// { type: 'TEXT_DETECTION', maxResults: 5 },
							{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 5 }
							// { type: 'SAFE_SEARCH_DETECTION', maxResults: 5 },
							// { type: 'IMAGE_PROPERTIES', maxResults: 5 },
							// { type: 'CROP_HINTS', maxResults: 5 },
							// { type: 'WEB_DETECTION', maxResults: 5 }
						],
						image: {
							source: {
								imageUri: image
							}
						}
					}
				]
			});
			let response = await fetch(
				'https://vision.googleapis.com/v1/images:annotate?key=' +
					Environment['GOOGLE_CLOUD_VISION_API_KEY'],
				{
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json'
					},
					method: 'POST',
					body: body
				}
			);
			let responseJson = await response.json();
			// console.log(responseJson);
			this.setState({
				googleResponse: responseJson,
				uploading: false
			});
		} catch (error) {
			console.log(error);
		}
	};

	
}

async function uploadImageAsync(uri) {
	const blob = await new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.onload = function() {
			resolve(xhr.response);
		};
		xhr.onerror = function(e) {
			console.log(e);
			reject(new TypeError('Network request failed'));
		};
		xhr.responseType = 'blob';
		xhr.open('GET', uri, true);
		xhr.send(null);
	});

	const storage1 = firebase.storage;
	const storage = getStorage();
	const storageRef = ref(storage, "picture");
	// console.log(Environment['FIREBASE_API_KEY']);

	await uploadBytes(storageRef, blob).then((snapshot) => {
		console.log('Uploaded an blob !');
	});

	let downloadURL
	await getDownloadURL(storageRef).then((url) => {
		console.log('get downloadURL !	' + url);
		downloadURL = url;
		
	})
	
	blob.close();
	return downloadURL;
}

// Can use this function below, OR use Expo's Push Notification Tool-> https://expo.dev/notifications
async function sendPushNotification(expoPushToken, mes) {
	const message = {
	  to: expoPushToken,
	  sound: 'default',
	  title: '智慧藥盒服藥通知',
	  body: mes,
	  data: { someData: mes },
	};
  
	console.log(mes);
	await fetch('https://exp.host/--/api/v2/push/send', {
	  method: 'POST',
	  headers: {
		Accept: 'application/json',
		'Accept-encoding': 'gzip, deflate',
		'Content-Type': 'application/json',
	  },
	  body: JSON.stringify(message),
	});
}
  
async function registerForPushNotificationsAsync() {
	let token;
	if (Constants.isDevice) {
	  const { status: existingStatus } = await Notifications.getPermissionsAsync();
	  let finalStatus = existingStatus;
	  if (existingStatus !== 'granted') {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
	  }
	  if (finalStatus !== 'granted') {
		alert('Failed to get push token for push notification!');
		return;
	  }
	  token = (await Notifications.getExpoPushTokenAsync()).data;
	  console.log(token);
	} else {
	  alert('Must use physical device for Push Notifications');
	}
  
	if (Platform.OS === 'android') {
	  Notifications.setNotificationChannelAsync('default', {
		name: 'default',
		importance: Notifications.AndroidImportance.MAX,
		vibrationPattern: [0, 250, 250, 250],
		lightColor: '#FF231F7C',
	  });
	}
  
	return token;
}

  async function schedulePushNotification(mes, hour, min, id) {
	await Notifications.scheduleNotificationAsync({
	 	content: {
			title: "智慧藥盒服藥通知",
			body: mes,
			data: { data: 'goes here' },
	  	},
	  	trigger: {
			hour: hour,
			minute: min,
			repeats: true,
			channelId:id
		},
	});
  }


const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		paddingTop: 50,
		paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
	},
	developmentModeText: {
		marginBottom: 20,
		color: 'rgba(0,0,0,0.4)',
		fontSize: 14,
		lineHeight: 19,
		textAlign: 'center'
	},
	contentContainer: {
		paddingTop: 30
	},

	getStartedContainer: {
		alignItems: 'center',
		marginHorizontal: 50
	},

	getStartedText: {
		fontSize: 17,
		color: 'rgba(96,100,109, 1)',
		lineHeight: 24,
		textAlign: 'center'
	},

	getGeneralText: {
		fontSize: 15,
		color: 'rgba(0,0,0, 1)',
		lineHeight: 24,
		textAlign: 'center'
	},

	helpContainer: {
		marginTop: 15,
		alignItems: 'center'
	}
});