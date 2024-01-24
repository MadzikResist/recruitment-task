import { StatusBar } from 'react-native';
import {FlatList, StyleSheet, Text, View, Image} from 'react-native';
import React, {useCallback, useEffect, useState} from "react";
import loading from './src/assets/loading.gif';
import {convertMsToSec} from "./src/utils/convertMsToSec";
import {updateRecords} from "./src/utils/updateRecords";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState('');
  const [tracks, setTracks] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `grant_type=client_credentials&client_id=${process.env.EXPO_PUBLIC_CLIENT_ID}&client_secret=${process.env.EXPO_PUBLIC_CLIENT_SECRET}`,
        });
        const data = await response.json();

        setAccessToken(data.access_token);

        const responseTracks = await fetch(
            'https://api.spotify.com/v1/search?q=coding&market=us&type=track&limit=20',
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.access_token}`
              },
            }
        );
        const tracks = await responseTracks.json();

        setTracks(tracks.tracks.items);
        setOffset(tracks.tracks.offset + 20);
        setHasMore(tracks.tracks.offset + 20 < tracks.tracks.total);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
    updateRecords(setTracks)
  }, []);

  const loadMore = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
          `https://api.spotify.com/v1/search?q=coding&market=us&type=track&limit=20&offset=${offset}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          }
      );
      const tracks = await response.json();
      setTracks((prevState) => [...prevState, ...tracks.tracks.items]);
      setOffset(tracks.tracks.offset + 20);
      setHasMore(tracks.tracks.offset + 20 < tracks.tracks.total);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const renderListItem = ({ item }) => (
      <View style={styles.oneElement} key={item.id}>
        <View style={styles.elementWrapper}>
          <View style={styles.playSongInformation}>
            <Image
                source={{ uri: item.album.images[0].url }}
                style={styles.photoTrack}
            />
            <View style={styles.songInformation}>
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>{item.name}</Text>
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.artist}>{item.artists[0].name}</Text>
            </View>
          </View>
          <Text style={styles.songTime}>{convertMsToSec(item.duration_ms)}</Text>
        </View>
      </View>
  );

  const handleEndReached = useCallback( async() => {
    if (hasMore && !isLoading) {
      await loadMore();
    }
  }, [hasMore, isLoading]);

  return (
      <View style={styles.container}>
          <FlatList
              data={tracks}
              renderItem={renderListItem}
              keyExtractor={(item) => item.id}
              onEndReached={handleEndReached}
              style={{paddingHorizontal: 16}}
              ListFooterComponent={isLoading && <Image resizeMode="contain" source={loading} style={styles.loading} />}
          />
      </View>
  );
}

const styles= StyleSheet.create({
  container: {
    paddingTop: StatusBar.currentHeight || 0,
    backgroundColor: '#181b23',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading:{
    width: '100%',
    height: 20,
    alignSelf: 'center',
    marginBottom: 16
  },
  photoTrack:{
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 50
  },
  oneElement:{
    marginVertical: 16,
    paddingVertical: 8,
    backgroundColor: '#202530',
    borderRadius: 8,
    paddingHorizontal: 16,
    display: 'flex',
    flexDirection:'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  elementWrapper:{
    backgroundColor:'#202530',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection:'row',
  },
  playSongInformation:{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    flexDirection:'row',
  },
  songInformation:{
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    width: '70%',
  },
  title: {
    color: '#fff',
    overflow: 'hidden',
  },
  artist:{
    fontSize: 13,
    color: '#ea5c47'
  },
  songTime:{
    color: '#6c6c6c',
    fontSize: 13,
  }
});
