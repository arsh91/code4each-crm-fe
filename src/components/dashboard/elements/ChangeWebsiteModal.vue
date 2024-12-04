<template>
  <div id="myModal" class="modal fade" role="dialog">
    <div class="modal-dialog">
      <!-- Modal content-->
      <div class="modal-content project-details-popup">
        <button type="button" class="close" data-dismiss="modal">
          &times;
        </button>

        <div class="modal-header">
          <h3>Change your wesbite</h3>
        </div>
        <div class="modal-body">
          <div class="card-wrappers">
            <div v-for="(site, index) in allSitesData" :key="index">
              <div
                class="card"
                :class="activeSite == site.website_id ? 'active' : ''"
                @click="changeSite(site.website_id, index)"
              >
                <i
                  class="fa fa-check"
                  aria-hidden="true"
                  v-if="activeSite == site.website_id ? 'active' : ''"
                ></i>

                <div class="card-primary">
                  <div class="valign">
                    <h5>
                      <span class="cards-icons">
                        {{ site.business_name.charAt(0).toUpperCase() }}
                      </span>
                      <br />
                    </h5>
                  </div>
                </div>
                <div class="card-content">
                  <div class="form-content">
                    <form class="text-start mb-2 mt-3">
                      <div class="form-field mb-4">
                        <h4 class="form-label text-dark">
                          {{ site.business_name }}
                        </h4>
                        <div class="input-group mb-3">
                          <a href="#" class="website-links">
                            {{ site?.website_detail?.website_domain }}
                          </a>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                <AnimationLoader v-if="isLoading[index]" svgClass="shapea" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer"></div>
    </div>
  </div>
</template>
<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref, watch, defineProps, onMounted, computed } from "vue";
import SelectBox from "@/components/common/SelectBox.vue";
import ChangeWebsiteModal from "@/components/dashboard/elements/ChangeWebsiteModal.vue";
import { useStore } from "@/stores/store";
import { boolean } from "yup";
import WordpressService from "@/service/WordpressService";
import AnimationLoader from "@/components/common/AnimationLoader.vue";

const props = defineProps({
  allSitesData: Object,
  activeSite: String,
});
const route = useRoute();
const router = useRouter();
const currentRoute = ref(route.path);
const allSitesData = ref([]);
const isActive = (routePath) => route.path === routePath;
const store = useStore();
const activeSite = ref();
const isLoading = ref(Array(allSitesData.length).fill(false));

watch(
  () => props.allSitesData,
  (newFullPath, oldcurrentRouteFullPath) => {
    allSitesData.value = props.allSitesData;
    activeSite.value = store.websiteId;
  }
);

onMounted(async () => {
  allSitesData.value = props.allSitesData;
});

const changeSite = (selectedValue, index) => {
  isLoading.value[index] = true;
  store.updateWebsiteId(selectedValue);
  setTimeout(function () {
    isLoading.value[index] = false;
  }, 2000);
};
</script>