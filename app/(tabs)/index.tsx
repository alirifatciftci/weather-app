import { Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type DailyWeather = {
  date: string;
  temperature: number;
  weatherCode: number;
  wind: number;
  humidity: number;
  precipitation: number;
  uv: number;
};

type City = {
  name: string;
  latitude: number;
  longitude: number;
};

const cities: City[] = [
  { name: "İstanbul", latitude: 41.0082, longitude: 28.9784 },
  { name: "Ankara", latitude: 39.9334, longitude: 32.8597 },
  { name: "İzmir", latitude: 38.4192, longitude: 27.1287 },
  { name: "Antalya", latitude: 36.8969, longitude: 30.7133 },
];

const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

function getCardBgColor(code: number) {
  if ([0, 1].includes(code)) return "#ffe082";
  if ([2, 3, 45, 48].includes(code)) return "#b3e5fc";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "#b2dfdb";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "#e1f5fe";
  if ([95, 96, 99].includes(code)) return "#b39ddb";
  return "#cfd8dc";
}

function getWeatherIcon(code: number) {
  if ([0, 1].includes(code)) return "☀️";
  if ([2, 3, 45, 48].includes(code)) return "⛅";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌦️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "☁️";
}

export default function App() {
  const [dailyWeather, setDailyWeather] = useState<DailyWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<City>(cities[0]);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    const getWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.latitude}&longitude=${selectedCity.longitude}&daily=temperature_2m_max,weathercode,precipitation_sum,windspeed_10m_max,uv_index_max,relative_humidity_2m_max&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();

        const dates: string[] = data.daily.time;
        const temps: number[] = data.daily.temperature_2m_max;
        const codes: number[] = data.daily.weathercode;
        const winds: number[] = data.daily.windspeed_10m_max;
        const uvs: number[] = data.daily.uv_index_max;
        const hums: number[] = data.daily.relative_humidity_2m_max;
        const precs: number[] = data.daily.precipitation_sum;

        if (!dates || !temps || !codes || dates.length === 0) {
          setError("Veri eksik veya hatalı.");
          setLoading(false);
          return;
        }

        const weatherArr: DailyWeather[] = [];
        for (let i = 0; i < dates.length; i++) {
          weatherArr.push({
            date: dates[i],
            temperature: temps[i],
            weatherCode: codes[i],
            wind: winds[i],
            humidity: hums[i],
            precipitation: precs[i],
            uv: uvs[i],
          });
        }
        setDailyWeather(weatherArr);
        setLoading(false);
      } catch (err) {
        setError("Veri alınırken hata oluştu.");
        setLoading(false);
      }
    };

    getWeather();
  }, [selectedCity]);

  function getDayName(dateStr: string) {
    const date = new Date(dateStr);
    return dayNames[date.getDay()];
  }

  const today = dailyWeather[0];
  const nextDays = dailyWeather.slice(1);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#1976D2" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#e3eaf2" />
      {/* Üst bar */}
      <View style={styles.topBar}>
        <Text style={styles.header}>{selectedCity.name} Hava Durumu</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={28} color="#1976D2" />
        </TouchableOpacity>
      </View>

      {/* Şehir seçme modalı */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Şehir Seç</Text>
            {cities.map(city => (
              <TouchableOpacity
                key={city.name}
                style={styles.cityButton}
                onPress={() => {
                  setSelectedCity(city);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.cityButtonText}>{city.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {loading ? (
        <View style={{ marginTop: 30 }}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Hava durumu yükleniyor...</Text>
        </View>
      ) : error ? (
        <Text style={{ color: "red", marginTop: 20, fontFamily: "Poppins_600SemiBold" }}>{error}</Text>
      ) : (
        <>
          {/* Üstte bugünün özet kartı */}
          {today && (
            <View style={[styles.todayCard, { backgroundColor: getCardBgColor(today.weatherCode) }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.todayIcon}>{getWeatherIcon(today.weatherCode)}</Text>
                </View>
                <View style={{ flex: 2 }}>
                  <Text style={styles.todayTemp}>{today.temperature.toFixed(1)}°C</Text>
                  <Text style={styles.todayDesc}>{getDayName(today.date)} - {new Date(today.date).toLocaleDateString("tr-TR")}</Text>
                </View>
              </View>
              {/* Ekstra: Bugünün detayları */}
              <View style={styles.todayDetailsRow}>
                <View style={styles.detailBox}>
                  <Ionicons name="water-outline" size={18} color="#1976D2" />
                  <Text style={styles.detailText}>{today.humidity}%</Text>
                </View>
                <View style={styles.detailBox}>
                  <Ionicons name="rainy-outline" size={18} color="#1976D2" />
                  <Text style={styles.detailText}>{today.precipitation} mm</Text>
                </View>
                <View style={styles.detailBox}>
                  <Ionicons name="navigate-outline" size={18} color="#1976D2" />
                  <Text style={styles.detailText}>{today.wind} km/h</Text>
                </View>
                <View style={styles.detailBox}>
                  <Ionicons name="sunny-outline" size={18} color="#1976D2" />
                  <Text style={styles.detailText}>UV {today.uv}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Ortada haftalık kartlar */}
          <View style={styles.nextDaysContainer}>
            <ScrollView horizontal contentContainerStyle={styles.cardRow} showsHorizontalScrollIndicator={false}>
              {nextDays.map((day, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.card,
                    { backgroundColor: getCardBgColor(day.weatherCode) }
                  ]}
                >
                  <Text style={styles.day}>{getDayName(day.date)}</Text>
                  <Text style={styles.icon}>{getWeatherIcon(day.weatherCode)}</Text>
                  <Text style={styles.temp}>{day.temperature.toFixed(1)}°C</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Altta Weather başlığı ve küçük bilgi kartları */}
          <View style={styles.weatherInfoSection}>
            <Text style={styles.weatherInfoTitle}>Weather</Text>
            <View style={styles.infoCardRow}>
              <View style={styles.infoCard}>
                <Ionicons name="water-outline" size={20} color="#1976D2" />
                <Text style={styles.infoCardLabel}>Nem</Text>
                <Text style={styles.infoCardValue}>{today?.humidity}%</Text>
              </View>
              <View style={styles.infoCard}>
                <Ionicons name="rainy-outline" size={20} color="#1976D2" />
                <Text style={styles.infoCardLabel}>Yağış</Text>
                <Text style={styles.infoCardValue}>{today?.precipitation} mm</Text>
              </View>
              <View style={styles.infoCard}>
                <Ionicons name="navigate-outline" size={20} color="#1976D2" />
                <Text style={styles.infoCardLabel}>Rüzgar</Text>
                <Text style={styles.infoCardValue}>{today?.wind} km/h</Text>
              </View>
              <View style={styles.infoCard}>
                <Ionicons name="sunny-outline" size={20} color="#1976D2" />
                <Text style={styles.infoCardLabel}>UV</Text>
                <Text style={styles.infoCardValue}>{today?.uv}</Text>
              </View>
            </View>
          </View>

          {/* En altta örnek bilgi kutusu */}
          <View style={styles.bottomInfoBox}>
            <Text style={styles.bottomInfoCity}>{selectedCity.name}</Text>
            <Text style={styles.bottomInfoTime}>{new Date().toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}</Text>
            <Text style={styles.bottomInfoDesc}>Bugün hava {getWeatherIcon(today?.weatherCode || 0)} {today?.temperature?.toFixed(1)}°C</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3eaf2',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 18
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
  },
  header: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#1976D2',
    letterSpacing: 0.5
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCard: {
    width: '100%',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginBottom: 18,
    elevation: 3,
    shadowColor: '#1976D2',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }
  },
  todayIcon: {
    fontSize: 64,
    marginRight: 10,
    textAlign: 'center'
  },
  todayTemp: {
    fontSize: 36,
    fontFamily: 'Poppins_700Bold',
    color: '#1976D2',
    marginBottom: 2
  },
  todayDesc: {
    fontSize: 16,
    color: '#555',
    fontFamily: 'Poppins_400Regular'
  },
  nextDaysContainer: {
    width: '100%',
    marginTop: 6,
    marginBottom: 8
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 10,
    gap: 10
  },
  card: {
    marginHorizontal: 5,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: 'center',
    width: 90,
    elevation: 2,
    shadowColor: '#1976D2',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 }
  },
  day: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1976D2',
    marginBottom: 6
  },
  icon: {
    fontSize: 28,
    marginBottom: 6
  },
  temp: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#333'
  },
  loadingText: {
    fontFamily: 'Poppins_600SemiBold'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    minWidth: 220,
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 14,
    color: '#1976D2'
  },
  cityButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: '#E3F2FD',
    width: 130,
    alignItems: 'center'
  },
  cityButtonText: {
    fontSize: 15,
    color: '#1976D2',
    fontFamily: 'Poppins_600SemiBold'
  },
  todayDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 18,
    marginBottom: 2,
    gap: 8,
  },
  detailBox: {
    backgroundColor: '#e3eaf2',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  detailText: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#1976D2',
    fontSize: 14,
    marginLeft: 4,
  },
  weatherInfoSection: {
    width: '100%',
    marginTop: 18,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    elevation: 2,
    shadowColor: '#1976D2',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }
  },
  weatherInfoTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#1976D2',
    marginBottom: 10,
    marginLeft: 4
  },
  infoCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  infoCard: {
    backgroundColor: '#e3eaf2',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    width: 70,
    elevation: 1,
  },
  infoCardLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#1976D2',
    marginTop: 2
  },
  infoCardValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#333',
    marginTop: 2
  },
  bottomInfoBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
    shadowColor: '#1976D2',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }
  },
  bottomInfoCity: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#1976D2'
  },
  bottomInfoTime: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#888'
  },
  bottomInfoDesc: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#333',
    marginTop: 4
  },
});
