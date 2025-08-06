<template>
  <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/ungveloper/web-fonts/GmarketSans/font-face.css" />
  <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/ungveloper/web-fonts/GmarketSans/font-family.css" />
  <div id="container">
    <section id="today" v-if="weatherData">
      <p id="city">{{ today }}</p>
      <h1 id="local">
        <button @click="openModal"><MapPin :size="32" color="#ffffff" class="mapPin" /></button><span>{{ cityName[weatherData.name] || weatherData.name }}</span>
      </h1>
      <div class="icons">
        <img :src="`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`" :alt="weatherData.weather[0].description" />
        <div>
          <p class="temperature">{{ weatherData.main.temp.toFixed(1) }}°C</p>
          <p class="info">{{ weatherData.weather[0].description }}</p>
        </div>
      </div>
      <p class="low-high">최저 : {{ weatherData.main.temp_min.toFixed(1) }}°C / 최고 : {{ weatherData.main.temp_max.toFixed(1) }}°C</p>
    </section>
    <section id="time">
      <div class="inner">
        <h3>시간대별 예보</h3>
        <div v-if="hourForecast.length" class="weatherContainer">
          <div v-for="forecast in hourForecast" :key="forecast.dt">
            <p>{{ new Date(forecast.dt_txt).getHours() }}시</p>
            <img :src="`http://openweathermap.org/img/wn/${forecast.weather[0].icon}@4x.png`" :alt="forecast.weather[0].description" class="timeIcon">
            <p class="weekTemp">{{ forecast.main.temp.toFixed(1) }}°C</p>
            <p class="description">{{ forecast.weather[0].description }}</p>
          </div>
        </div>
        <div v-else class="message">시간대별 날씨 정보를 불러오는 중입니다..</div>
      </div>
    </section>
    <section id="etc" v-if="weatherData">
      <div class="inner">
        <div>
          <h3>일출/일몰</h3>
          <p><span><Sunrise :size="20" color="#ffffff" class="sunIcon" /></span>{{ sunTime(weatherData?.sys?.sunrise) || '정보 없음' }}</p>
          <p><span><Sunset :size="20" color="#ffffff" class="sunIcon" /></span>{{ sunTime(weatherData?.sys?.sunset) || '정보 없음' }}</p>
        </div>
        <div>
          <h3>체감온도</h3>
          <p><span><ThermometerSun :size="20" color="#ffffff" class="thermometer" /></span>{{ weatherEtc.feelsLike.toFixed(1) }}°C</p>
        </div>
        <div>
          <h3>습도</h3>
          <p><span><Droplets :size="20" color="#ffffff" class="droplets" /></span>{{ weatherEtc.humidity }}%</p>
        </div>
        <div>
          <h3>강수량</h3>
          <p><span><CloudRain :size="20" color="#ffffff" class="cloudRain" /></span>{{ weatherEtc.rain1h }}mm</p>
        </div>
        <div>
          <h3>풍속</h3>
          <p><span><Wind :size="20" color="#ffffff" class="wind" /></span>{{ weatherEtc.windSpeed }}%</p>
        </div>
      </div>
    </section>
    <!-- 위치검색창 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>도시 검색</h3>
          <button class="close-btn" @click="closeModal"><X /></button>
        </div>
        <div class="modal-body">
          <input v-model="searchQuary" type="text" placeholder="도시 이름을 입력하세요(예:Seoul)" @keyup.enter="searchCity" class="search-input" />
          <button @click="searchCity" class="search-btn" :disabled="isSearching">
            {{  isSearching ? '검색 중...' : '검색' }}
          </button>
          <div v-if="searchResults.length" class="search-results">
            <div v-for="result in searchResults" :key="`${result.lat}-${result.lon}`" @click="selectCity(result)" class="result-item">
              <strong>{{ result.name }}</strong>
              <span v-if="result.state">, {{  result.state }}</span>
              <span>, {{  result.country }}</span>
            </div>
          </div>
          <div v-if="searchError" class="error-message">{{  searchError }}</div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { MapPin, Sunrise, Sunset, Wind, Droplets, CloudRain, ThermometerSun, X } from 'lucide-vue-next';

export default {
  name: 'App',
  components: {MapPin, Sunrise, Sunset, Wind, Droplets, CloudRain, ThermometerSun, X},

  setup() {
    const API_KEY = 'aeb2957778eb3246138ec4e098bae748';
    const weatherData = ref(null);
    const cityName = {
      Seoul: '서울',
      Busan: '부산',
      Incheon: '인천',
      Daegu: '대구',
      Daejeon: '대전',
      Gwangju: '광주',
      Yachon: '광주', /* Yach’on */
      Ulsan: '울산',
      Sejong: '세종',
      Gongju: '공주',
      Suwon: '수원', /* Namhyang-dong */
      Yongin: '용인', /* Samga-dong */
      Changwon: '창원',
      Goyang: '고양', /* Goyang-si */
      Cheongju: '청주', /* Cheongju-si */
      Jeonju: '전주',
      Jeju: '제주', /* Jeju City */
      Chuncheon: '춘천',
      Gangneung: '강릉',
      Andong: '안동',
      Pohang: '포항',
      Mokpo: '목포',
      Suncheon: '순천',
      Yeosu: '여수',
      Reisui: '여수',
      Gunsan: '군산',
      Gumi: '구미',
      Jinju: '진주',
      Iksan: '익산',
      Hwaseong: '화성', /* Hwaseong-si */
      Ansan: '안산', /* Ansan-si */
      Cheonan: '천안',
      Gimhae: '김해',
      Kwangmyŏng: '광명',
      Paju: '파주',
      Uijeongbu: '의정부', /* Ganeung i dong */
      Siheung: '시흥', /* Ansan-si */
      Anyang: '안양', /* Anyang-si */
      Gunpo: '군포',
      Gimpo: '김포', /* Gimpo-si */
      Namyangju: '남양주',
      Ganghwa: '강화', /* Ganghwa-gun */
      Donghae: '동해', /* Goseong */
      Samcheok: '삼척',
      Sacheon: '사천', /* Shisen */
      Kŏje: '거제',
      Tongyeong: '통영', /* T’aep’ong-dong */
      Gangneung: '강릉',
      Wŏnju: '원주',
      Jecheon: '제천',
      Mungyeong: '문경',
      Boryeong: '보령',
      Tangjin: '당진',
      Asan: '아산',
      Nonsan: '논산',
      Seosan: '서산', /* Seosan City */
      Kwangyang: '광양',
      Naju: '나주'
    };
    const weatherEtc = ref({
      feelsLike: null,
      humidity: null,
      windSpeed: null,
      rain1h: null,
      clouds: null,
    });
    const hourForecast = ref([]);
    const showModal = ref(false);
    const searchQuary = ref('');
    const searchResults = ref([]);
    const isSearching = ref(false);
    const searchError = ref('');
    
    const today = computed(() =>
      new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    );
    
    // 날씨 API 호출 함수
    const weatherUrl = async (lat, lon) => {
      try {
        const Url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;
        const response = await axios.get(Url);
        weatherData.value = response.data;
        weatherEtc.value.feelsLike = response.data.main?.feels_like ?? null;
        weatherEtc.value.humidity = response.data.main?.humidity ?? null;
        weatherEtc.value.windSpeed = response.data.wind?.speed ?? null;
        weatherEtc.value.rain1h = response.data.rain?.['1h'] ?? 0;
        weatherEtc.value.clouds = response.data.clouds?.all ?? null;
        await getForecast(lat, lon); //시간대별 날씨 추가
      } catch (error) {
        alert(`API 호출 실패: ${error.message}`);
      }
    };

    //시간대별 날씨
    const getForecast = async (lat, lon) => {
      try {
      const Url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;
      const response = await axios.get(Url);
      hourForecast.value = response.data.list.slice(0, 10);
      } catch (error) {
        alert(`예보 호출 실패: ${error.message}`);
      }
    };

    //날씨API 호출함수로 마운트 실행
    onMounted(() => {
      locationInfo();
    });

    const fail = () => {
      console.warn('위치 권한 거부됨, 서울 날씨로 대체');
      weatherUrl(37.5665, 126.9780);
    };

    //위치정보 호출 함수
    const locationInfo = () => {
      if (!navigator.geolocation) {
        alert('위치 정보를 불러올 수 없습니다.');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        //getCurrentPosition은 인자를 3개까지만 사용 가능!(성공,실패,옵션 순으로 들어있음)
        async (position) => {
          const { latitude: lat, longitude: lon } = position.coords;
          console.log(`위도 ${lat}, 경도 ${lon}`);
          await weatherUrl(lat, lon);
        },
        fail,
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    };

    //일출일몰시간
    const sunTime = (timestamp) => {
      const date = new Date(timestamp * 1000);
      return date.toLocaleTimeString('ko-KR', {hour:'2-digit', minute:'2-digit'});
    };

    //위치 검색창
    const openModal = () => {
      showModal.value = true;
      searchQuary.value = '';
      searchResults.value = [];
      searchError.value = '';
    }

    const closeModal = () => {
      showModal.value = false;
    }

    const searchCity = async () => {
      if( !searchQuary.value.trim() ){
        searchError.value = '도시 이름을 입력하세요';
        return;
      }
      isSearching.value = true;
      searchError.value = '';
      searchResults.value = [];

      try{
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuary.value)}&limit=5&appid=${API_KEY}`;
        const response = await axios.get(url);
        if( response.data.length === 0 ){
          searchError.value = '검색 결과가 없습니다. 다른 도시 이름을 입력하세요';
        } else {
          searchResults.value = response.data;
        }
      } catch (error) {
        searchError.value = '검색 중 오류가 발생했습니다.';
        console.error('도시 검색 실패 : ', error)
      } finally {
        isSearching.value = false;
      }
    }

    const selectCity = async (city) => {
      try {
        await weatherUrl(city.lat, city.lon);
        closeModal();
      } catch (error) {
        searchError.value = '선택한 도시의 날씨 정보를 불러올 수 없습니다.';
      }
    };

    return {
      weatherData,
      hourForecast,
      locationInfo,
      cityName,
      today,
      sunTime,
      weatherEtc,
      showModal,
      searchQuary,
      searchResults,
      isSearching,
      searchError,
      openModal,
      closeModal,
      searchCity,
      selectCity
    };
  }
};
</script>