import { colors } from "@/src/theme/colors";
import { typography } from "@/src/theme/typography";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Button,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface SmartInputProps {
  title: string;
  value: string;
  placeholder: string;
  onChange: (text: string) => void;
}

const SmartInput: React.FC<SmartInputProps> = ({
  title,
  value,
  placeholder,
  onChange,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date()); // nur zwischenspeicher
  const [confirmedDate, setConfirmedDate] = useState<Date | null>(null);

  const lowerTitle = title?.toLowerCase?.() || "";
  const isPassword =
    lowerTitle === "passwort" || lowerTitle === "passwort wiederholen";
  const isDate = lowerTitle === "geburtsdatum" || lowerTitle === "datum";

  const onDateChange = (_: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      if (selectedDate) {
        setConfirmedDate(selectedDate);
        onChange(selectedDate.toISOString().split("T")[0]);
      }
      setShowPicker(false);
    } else {
      if (selectedDate) setTempDate(selectedDate);
    }
  };

  const confirmIOSDate = () => {
    setConfirmedDate(tempDate);
    onChange(tempDate.toISOString().split("T")[0]);
    setShowPicker(false);
  };

  const formattedDate =
    confirmedDate?.toISOString().split("T")[0] || value || placeholder;

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{title}</Text>

      {isDate ? (
        <>
          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              setShowPicker(true);
            }}
            style={styles.inputContainer}
          >
            <Text style={{ color: value ? "#333" : "#A0A0A0" }}>
              {formattedDate}
            </Text>
          </Pressable>

          {showPicker && (
            <View
              style={{
                backgroundColor: "#f9f9f9",
                borderRadius: 10,
                marginTop: 10,
              }}
            >
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                locale="de-DE"
                themeVariant="light"
              />
              {Platform.OS === "ios" && (
                <Button title="Fertig" onPress={confirmIOSDate} />
              )}
            </View>
          )}
        </>
      ) : (
        <View style={styles.inputContainer}>
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={"#A0A0A0"}
            secureTextEntry={isPassword}
            style={styles.input}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    marginBottom: 8,
  },
  label: {
    ...typography.label,
    color: colors.black,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  input: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Inter",
  },
});

export default SmartInput;
