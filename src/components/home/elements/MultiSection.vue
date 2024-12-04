<script setup>
import RegisterButton from "../../common/RegisterButton.vue";
</script>
<template>
  <!-----------multi-sec start------------>
  <section
    class="multi-section"
    style="background-image: url('images/img.png')"
  >
    <div class="container">
      <div class="row align-items-center justify-content-between">
        <div class="col-12 col-lg-6 mb-5 mb-lg-0">
          <div class="card border-0 rounded">
            <div class="position-relative p-3">
              <img src="/images/09.jpg" alt="Image" class="card-img-top" />
            </div>
            <div class="card-body p-4">
              <h5>
                Watch make it simple to take your business success with
                code4each.
              </h5>
              <p class="mb-0">
                code4each Amazing Landing Page of businesses need access to
                development resources.
              </p>
            </div>
          </div>
        </div>
        <div class="col-12 col-lg-6">
          <div class="mb-5">
            <h2 class="display-4 mb-3">
              <span class="font-w-4 d-block">Perfect Solution</span> For your
              Small Business
            </h2>
            <p class="lead">
              Code4each Amazing Landing Page of businesses need access to
              development resources.
            </p>
          </div>
          <div class="row align-items-center">
            <RegisterButton
              buttonClass="btn-sm multi-section btn-primary  text-start me-1 mt-5"
              :paragraph="true"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
  <!--------multi-sec end------->
</template>