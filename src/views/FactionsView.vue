<template>
  <div id="factionsView" :class="{ animate: animateView }" :style="{ 'animation-delay': animationDelay }" class="content-container">
    <section id="factions" :class="{ animate: animate }" class="section-container">
      <div class="section-header clipped-medium-backward">
        <img src="/faction-logos/barony.svg" />
        <h1>KNOWN FACTIONS</h1>
      </div>
      <div class="section-content-container">
        <div class="factions-list-container">
          <Faction
            v-for="item in factions"
            :key="item.title"
            :faction="item"
            :animate="animate"
            @select-faction="selectFaction(item)" />
        </div>
      </div>
    </section>
    
    <section id="factions-logs" :class="{ animate: animate }" class="section-container">
      <div style="height: 52px; overflow: hidden">
        <div class="section-header clipped-info-backward">
          <img src="/icons/conversation.svg" />
          <h1>KNOWN DETAILS</h1>
        </div>
        <div class="rhombus-back">&nbsp;</div>
      </div>
      
      <div class="section-content-container extra-margins" @click="handleMarkdownClick">
        <div class="faction" v-if="selectedFaction.title">
          <div class="name">
            <h1>{{ selectedFaction.location }} // {{ selectedFaction.time }}</h1>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2>{{ selectedFaction.title }}</h2>
                <button v-if="mappedLocation" @click="goToMap" class="map-link-btn">
                    <img src="/icons/orbital.svg" /> SHOW ON MAP
                </button>
            </div>
          </div>
          <vue-markdown-it :source="selectedFaction.content" class="markdown" />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { VueMarkdownIt } from '@f3ve/vue-markdown-it';
import Faction from "@/components/Faction.vue";
import FactionModal from "@/components/modals/FactionModal.vue";
import PilotModal from '@/components/modals/PilotModal.vue';

import locationsData from '@/assets/map/locations.json';

export default {
  components: {
    VueMarkdownIt,
    Faction,
  },
  props: {
    animate: { type: Boolean, required: true },
    factions: { type: Array, required: true },
    pilots: { type: Array, required: true, default: () => [] }, 
  },
  mounted() {
      this.checkUrlForFaction();
  },
  watch: {
    factions: {
        handler() {
            this.checkUrlForFaction();
        },
        immediate: true
    }
  },

  data() {
    return {
      selectedFaction: { type: Object },
      locations: locationsData
    };
  },
  computed: {
      mappedLocation() {
          if (!this.selectedFaction || !this.selectedFaction.title) return null;
          return this.locations.find(l => 
              l.type === 'faction' && 
              l.target.toUpperCase() === this.selectedFaction.title.toUpperCase()
          );
      }
  },
  methods: {
    checkUrlForFaction() {
        if (this.$route.query.faction && this.factions.length > 0 && !this.selectedFaction.title) {
          const targetTitle = this.$route.query.faction;
          const target = this.factions.find(f => f.title.toUpperCase() === targetTitle.toUpperCase());
          if (target) {
              this.selectFaction(target);
          }
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
    selectFaction(faction) {
      if (window.innerWidth <= 768) {
          this.$oruga.modal.open({
            component: FactionModal,
            custom: true,
            trapFocus: true,
            props: { 
                faction: faction,
                pilots: this.pilots, // Pass pilots for checking
                factions: this.factions  // Pass factions list
            },
            class: 'custom-modal',
            width: 1920,
          });
      } else {
          this.selectedFaction = faction;
      }
    },
    handleMarkdownClick(event) {
      const link = event.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      
      // --- HANDLE PILOT LINKS ---
      if (href && (href.startsWith('pilot://') || href.startsWith('pilots://'))) {
        event.preventDefault();
        let rawCallsign = href.replace(/^pilots?:\/\//, '');
        const callsign = decodeURIComponent(rawCallsign).toUpperCase();
        
        const pilot = this.pilots.find(p => p.callsign.toUpperCase() === callsign);
        
        if (pilot) {
          this.$oruga.modal.open({
            component: PilotModal,
            custom: true,
            trapFocus: true,
            props: { pilot: pilot, talents: [], skills: [], frames: [] },
            class: 'custom-modal',
            width: 1920,
          });
        }
      }

      // --- HANDLE MISSION LINKS ---
      else if (href && href.startsWith('mission://')) {
        event.preventDefault();
        const slug = decodeURIComponent(href.replace('mission://', ''));
        this.$router.push({ path: '/status', query: { mission: slug } });
      }

      // --- HANDLE FACTION LINKS ---
      else if (href && href.startsWith('faction://')) {
        event.preventDefault();
        const titleRaw = href.replace('faction://', '');
        const title = decodeURIComponent(titleRaw);
        const targetFaction = this.factions.find(e => e.title.trim() === title.trim());

        if (targetFaction) {
          this.selectFaction(targetFaction);
          const container = document.querySelector('#factions-logs .section-content-container');
          if(container) container.scrollTop = 0;
        }
      }
    }
  }
};
</script>

<style scoped>
/* Link Styles */
:deep(.markdown a[href^="pilot://"]),
:deep(.markdown a[href^="pilots://"]) {
  color: #FFC107;
  font-weight: bold;
  text-decoration: none;
  border-bottom: 1px dotted #FFC107;
  transition: background 0.2s;
}
:deep(.markdown a[href^="pilot://"]:hover),
:deep(.markdown a[href^="pilots://"]:hover) {
  background-color: rgba(255, 193, 7, 0.2);
  cursor: pointer;
}

:deep(.markdown a[href^="mission://"]) {
  color: #3269a8;
  font-weight: bold;
  text-decoration: none;
  border-bottom: 1px dotted #3269a8;
}
:deep(.markdown a[href^="mission://"]:hover) {
  background-color: rgba(50, 105, 168, 0.2);
  cursor: pointer;
}

:deep(.markdown a[href^="faction://"]) {
  color: #bd93f9; 
  font-weight: bold;
  text-decoration: none;
  border-bottom: 1px dotted #bd93f9;
}
:deep(.markdown a[href^="faction://"]:hover) {
  background-color: rgba(189, 147, 249, 0.2);
  cursor: pointer;
}

.map-link-btn {
    background: transparent;
    border: 1px solid var(--primary-color);
    color: var(--primary-color);
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
}

.map-link-btn:hover {
    background: var(--primary-color);
    color: var(--secondary-color);
}

.map-link-btn img {
    width: 16px;
    height: 16px;
    filter: invert(76%) sepia(21%) saturate(692%) hue-rotate(134deg) brightness(92%) contrast(84%); /* Approx match to primary color if black svg */
}

.map-link-btn:hover img {
    filter: brightness(0); /* Black on hover */
}
</style>