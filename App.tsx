import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { dataImporter, getShuffledQuotes } from './src/res/functions/DBFunctions';
import { strings } from './src/res/constants/Strings';
import { RootNavigation } from './src/res/util/RootNavigation';
import { QuotationInterface } from './src/res/constants/Interfaces';
import { HomeVertical } from './src/UI/Views/HomeVertical';

export default function App() {

  const [fontReady, setFontReady] = useState(false)
  const [shuffledQuotes, setShuffledQuotes] = useState<QuotationInterface[]>([]);

  useEffect(() => {
    const data = async () => {
      await dataImporter();
    };
    data();
    getShuffledQuotes(strings.database.defaultQuery, strings.database.defaultFilter).then((res) => {
      setShuffledQuotes(res);
    });
  }, []);
  
    return <RootNavigation initialRoute={"Home"} />;


}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
