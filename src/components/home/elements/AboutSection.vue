<script setup>
import RegisterButton from "../../common/RegisterButton.vue";
</script>
<template>
  <!--about start-->

  <section class="about-section">
    <div class="pricing-one__shape-1 zoom-fade">
      <img src="/images/pricing-one-shape-1.png" alt="" />
    </div>
    <div class="pricing-one__shape-2 float-bob-x">
      <img src="/images/pricing-one-shape-2.png" alt="" />
    </div>
    <div class="pricing-one__shape-3 float-bob-y">
      <img src="/images/pricing-one-shape-3.png" alt="" />
    </div>
    <div class="pricing-one__shape-4">
      <img src="/images/pricing-one-shape-4.png" alt="" />
    </div>
    <div class="pricing-one__shape-9">
      <img src="/images/pricing-one-shape-13.png" alt="" />
    </div>
    <div class="pricing-one__shape-10 zoominout">
      <img src="/images/pricing-one-shape-10.png" alt="" />
    </div>
    <div class="pricing-one__shape-11">
      <img src="/images/pricing-one-shape-11.png" alt="" />
    </div>
    <div class="pricing-one__shape-12 zoominout">
      <img src="/images/pricing-one-shape-10.png" alt="" />
    </div>
    <div class="pricing-one__shape-13">
      <img src="/images/pricing-one-shape-13.png" alt="" />
    </div>
    <div class="pricing-one__shape-14">
      <img src="/images/pricing-one-shape-14.png" alt="" />
    </div>
    <div class="pricing-one__shape-15 float-bob-x">
      <img src="/images/pricing-one-shape-15.png" alt="" />
    </div>
    <div class="pricing-one__shape-17">
      <img src="/images/pricing-one-shape-17.png" alt="" />
    </div>
    <div class="pricing-one__shape-18">
      <img src="/images/pricing-one-shape-18.png" alt="" />
    </div>
    <div class="pricing-one__shape-19">
      <img src="/images/pricing-one-shape-19.png" alt="" />
    </div>
    <div class="pricing-one__shape-21">
      <img src="/images/pricing-one-shape-21.png" alt="" />
    </div>
    <div class="container">
      <div class="row align-items-center justify-content-between">
        <div class="col-12 col-lg-6 mb-6 mb-lg-0">
          <img src="/images/04.png" alt="Image" class="img-fluid" />
        </div>
        <div class="col-12 col-lg-6 col-xl-5">
          <div>
            <h2 class="display-4 mb-3">
              <span class="font-w-4 d-block">Unlimited features</span> awaiting
              for you
            </h2>
            <p class="lead">
              We use the latest technologies it voluptatem accusantium
              doloremque laudantium, totam rem aperiam.
            </p>
          </div>
          <div>
            <div class="mb-3">
              <div class="d-flex align-items-start">
                <div class="me-0">
                  <span
                    class="list-dot"
                    data-bg-color="#01a479"
                    style="background-color: rgb(1, 164, 121)"
                  ></span>
                </div>
                <p class="text-muted">
                  Fast Performance technologies it voluptatem
                </p>
              </div>
            </div>
            <div class="mb-3">
              <div class="d-flex align-items-start">
                <div class="me-0">
                  <span
                    class="list-dot"
                    data-bg-color="#2f2f41"
                    style="background-color: rgb(47, 47, 65)"
                  ></span>
                </div>
                <p class="text-muted">
                  Quick Access For Build With Static Bootstarp Code
                </p>
              </div>
            </div>
            <div>
              <div class="d-flex align-items-start">
                <div class="me-0">
                  <span
                    class="list-dot"
                    data-bg-color="#01a479"
                    style="background-color: rgb(1, 164, 121)"
                  ></span>
                </div>
                <p class="text-muted">
                  Easy to Manage Your All Data access to development
                </p>
              </div>
            </div>
          </div>
          <RegisterButton
            buttonClass="btn-sm btn-primary text-start me-1"
            :paragraph="true"
          />
        </div>
      </div>
    </div>
  </section>

  <!-- about end -->
</template>