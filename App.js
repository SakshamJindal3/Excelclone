import React, { useEffect, useState } from "react";
import { View, Button, StyleSheet, ScrollView, Platform } from "react-native";
import { DataTable, TextInput } from "react-native-paper";
import * as XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [data, setData] = useState(() =>
    Array.from({ length: 10 }, () => Array(5).fill(""))
  );

  useEffect(() => {
    loadSavedData();
  }, []);

  const saveData = async () => {
    try {
      await AsyncStorage.setItem("@Excelclone:data", JSON.stringify(data));
    } catch (error) {
      console.log(error);
    }
  };

  const loadSavedData = async () => {
    try {
      const savedData = await AsyncStorage.getItem("@Excelclone:data");
      if (savedData) {
        setData(JSON.parse(savedData));
      } else {
        const initialData = Array.from({ length: 10 }, () => Array(5).fill(""));
        setData(initialData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (column, row, value) => {
    const updatedData = [...data];
    updatedData[row][column] = value;
    setData(updatedData);
    saveData();
  };

  const generateExcelFile = async () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const wbout = XLSX.write(workbook, { type: "Base64", bookType: "xlsx" });
    const sourceUri = `${FileSystem.documentDirectory}data.xlsx`;
    let destinationUri;

    if (Platform.OS === "android") {
      destinationUri = `${FileSystem.documentDirectory}Download/data.xlsx`;
    } else if (Platform.OS === "ios") {
      destinationUri = `${FileSystem.documentDirectory}data.xlsx`;
    } else {
      destinationUri = "Internal shared storage/Download/data.xlsx";
    }

    try {
      await FileSystem.writeAsStringAsync(sourceUri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await FileSystem.makeDirectoryAsync(
        `${FileSystem.documentDirectory}Download`,
        { intermediates: true }
      );

      await FileSystem.moveAsync({
        from: sourceUri,
        to: destinationUri,
      });

      console.log(
        "File saved successfully in Downloads folder:",
        destinationUri
      );
    } catch (error) {
      console.log("Error saving file:", error);
    }

    saveData();
  };

  const renderInputs = () => {
    const columnLabels = ["A", "B", "C", "D", "E"];
    const rowNames = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

    return (
      <>
        <DataTable.Header>
          <DataTable.Title></DataTable.Title>
          {columnLabels.map((label, index) => (
            <DataTable.Title key={index}>{label}</DataTable.Title>
          ))}
        </DataTable.Header>
        {data.map((row, rowIndex) => (
          <DataTable.Row key={rowIndex}>
            <DataTable.Cell>{rowNames[rowIndex]}</DataTable.Cell>
            {row.map((value, columnIndex) => {
              const cellName = `${columnLabels[columnIndex]}${rowNames[rowIndex]}`;
              return (
                <DataTable.Cell key={`${columnIndex}-${rowIndex}`}>
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={(text) =>
                      handleInputChange(columnIndex, rowIndex, text)
                    }
                    placeholder={cellName}
                    key={`${columnIndex}-${rowIndex}`}
                  />
                </DataTable.Cell>
              );
            })}
          </DataTable.Row>
        ))}
      </>
    );
  };

  return (
    <>
      <View style={styles.header}>
 
      </View>
      <View style={styles.container}>
        <ScrollView horizontal>
          <DataTable>{renderInputs()}</DataTable>
        </ScrollView>
      </View>
      <View style={styles.navbar}>
        <Button title="Download" onPress={generateExcelFile} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop:15,
    paddingTop: 40,
  },
  navbar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    height:60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  input: {
    height: 40,
    width: 100,
  },
});
