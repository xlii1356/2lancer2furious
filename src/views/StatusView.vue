<template>
  <div id="status" :class="{ animate: animateView }" :style="{ 'animation-delay': animationDelay }"
    class="content-container">
    
    <section id="missions" class="section-container" :style="{ 'animation-delay': animationDelay }">
      <div class="section-header clipped-medium-backward">
        <img src="/icons/campaign.svg" />
        <h1>Mission Log</h1>
      </div>
      <div class="section-content-container">
        <div class="mission-list-container">
          <Mission 
            v-for="item in sortedMissions" 
            :key="item.slug" 
            :mission="item" 
            :selected="missionSlug"
            :pilots="pilots"
            :locked-squad="getSquadForMission(item.slug)" 
            @click="selectMission(item.slug)" 
          />
        </div>
      </div>
    </section>

    <section id="assignment" class="section-container" :style="{ 'animation-delay': animationDelay }">
      <div class="section-header clipped-medium-backward">
        <img src="/icons/deployable.svg" />
        <h1>Current Assignment</h1>
      </div>
      
      <div class="section-content-container" style="overflow: hidden; position: relative;">
        <Transition name="slide-right" mode="out-in">
          <div :key="missionSlug" class="assignment-content">
             <div v-if="activeMission" style="display: flex; justify-content: flex-end; padding-bottom: 10px;">
                <button v-if="mappedLocation" @click="goToMap" class="map-link-btn">
                    <img src="/icons/orbital.svg" /> SHOW ON MAP
                </button>
             </div>
            <vue-markdown-it :source="missionMarkdown || 'No mission selected.'" class="markdown" />
          </div>
        </Transition>
      </div>
    </section>

    <div>
      <section id="reserves" class="section-container" :style="{ 'animation-delay': animationDelay }">
        <div class="section-header clipped-medium-backward">
          <img src="/icons/squad.svg" />
          <h1>Reserves</h1>
        </div>
        <div class="section-content-container">
          <div class="reserves-list-container">
            <Reserve 
              v-for="item in visibleReserves" 
              :key="item.name" 
              :reserve="item" 
              :pilots="pilots" 
            />
          </div>
        </div>
      </section>

      <section id="clocks" class="section-container" :style="{ 'animation-delay': animationDelay }">
        <div class="section-header clipped-medium-backward">
          <img src="/icons/clock.svg" />
          <h1>Clocks</h1>
        </div>
        <div class="section-content-container">
          <div class="clocks-list-container">
            <Clock 
              v-for="item in clocks" 
              :key="item.name" 
              :clock="item" 
              :animate="animate" 
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { VueMarkdownIt } from '@f3ve/vue-markdown-it';
import Mission from "@/components/Mission.vue";
import Reserve from "@/components/Reserve.vue";
import Clock from "@/components/Clock.vue";
import missionSquads from '@/assets/missions/squads.json';
import locationsData from '@/assets/map/locations.json';

export default {
  components: {
    VueMarkdownIt,
    Mission,
    Reserve,
    Clock,
  },
  props: {
    animate: { type: Boolean, required: true },
    initialSlug: { type: String, required: true },
    missions: { type: Array, required: true },
    pilots: { type: Array, required: true },
    clocks: { type: Array, required: true },
    reserves: { type: Array, required: true },
  },
  computed: {
    sortedMissions() {
      return [...this.missions].sort((a, b) => Number(a.slug) - Number(b.slug));
    },
    visibleReserves() {
      if (!this.reserves) return [];
      return this.reserves.filter(item => item && item.name !== 'Skill Point');
    },
    activeMission() {
        return this.missions.find(x => x.slug === this.missionSlug);
    },
    mappedLocation() {
        if (!this.activeMission) return null;
        return this.locations.find(l => 
            l.type === 'mission' && 
            l.target === this.activeMission.slug
        );
    }
  },
  data() {
    return {
      missionSlug: this.initialSlug,
      animateView: this.animate,
      animationDelay: "1.75s",
      clockAnimationDelay: "2500",
      missionMarkdown: "",
      squadData: missionSquads,
      locations: locationsData 
    };
  },
  created() {
    this.setAnimate();
    this.setClockAnimateDelay();
  },
  mounted() {
    this.checkUrlForMission();
  },
  watch: {
    missions: {
        handler() {
            this.checkUrlForMission();
        },
        immediate: true
    }
  },

  methods: {
    checkUrlForMission() {
        if (this.$route.query.mission) {
            this.selectMission(this.$route.query.mission);
        } 
        else if (this.missions.length > 0 && this.missionSlug === this.initialSlug) {
            this.selectMission(this.missions[0].slug);
        }
        
        if (this.missionSlug && !this.missionMarkdown) {
             this.selectMission(this.missionSlug);
        }
    },
    goToMap() {
        if (this.mappedLocation) {
            this.$router.push({ 
                path: '/map', 
                query: { highlight: this.mappedLocation.id } 
            });
        }
    },
    getSquadForMission(slug) {
      const record = this.squadData.find(s => s.missionSlug === slug);
      return record ? record.pilots : null;
    },
    selectMission(slug) {
      this.missionSlug = slug;
      let m = this.missions.find(x => x.slug === this.missionSlug);
      if(m) this.missionMarkdown = m.content;
    },
    setAnimate() {
      if (this.animate) {
        this.animateView = true;
      }
      let statusAnimated = window.sessionStorage.getItem("statusAnimated");
      if (statusAnimated) {
        this.animationDelay = "0s";
      }
      if (statusAnimated === null) {
        window.sessionStorage.setItem("statusAnimated", true);
      }
    },
    setClockAnimateDelay() {
      let delayToFloat = parseFloat(this.animationDelay.replace("s", ""));
      let finalClockDelay = delayToFloat * 600 + 600;
      this.clockAnimationDelay = finalClockDelay.toString();
    },
  },
};
</script>

<style scoped>
/* --- ANIMATION STYLES (MOVE RIGHT) --- */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.slide-right-enter-from {
  transform: translateX(-50px);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(50px);
  opacity: 0;
}
.assignment-content {
  width: 100%;
  height: 100%;
}

.map-link-btn {
    background: transparent;
    border: 1px solid var(--primary-color, #00ff00);
    color: var(--primary-color, #00ff00);
    padding: 5px 10px;
    font-family: "Big Shoulders Display", cursive;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: all 0.2s;
    letter-spacing: 1px;
    text-transform: uppercase;
}

.map-link-btn:hover {
    background: var(--primary-color, #00ff00);
    color: black;
}

.map-link-btn img {
    width: 16px;
    height: 16px;
    filter: invert(76%) sepia(21%) saturate(692%) hue-rotate(134deg) brightness(92%) contrast(84%);
}

.map-link-btn:hover img {
    filter: brightness(0);
}
</style>