<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>知情同意书</title>
    <style>
      .written-consent {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
      }
      .written-consent .weight {
        font-weight: bold;
      }
      .written-consent .total-contetn-box {
        padding: 0.3rem;
        background-color: #fff;
      }
      .written-consent p,
      .written-consent .detail,
      .written-consent .title,
      .written-consent .small {
        line-height: 1.2rem;
        font-size: 0.26rem;
        color: #333;
      }
      .written-consent .title {
        font-weight: bold;
      }
      .written-consent .detail {
        margin-bottom: 0;
        text-indent: 0.18rem;
      }
      .written-consent .last-detail {
        margin-bottom: 0.4rem;
      }
      .written-consent .small {
        margin-bottom: 0;
      }
      .written-consent .line {
        text-decoration: underline;
      }
      .scroll-total-wrap {
        background-color: #ededed;
      }
    </style>
  </head>
  <body>
    <div class="written-consent">
      <div class="scroll-total-wrap">
        <div class="protocol-details">{{ fileContent }}</div>
      </div>
    </div>
  </body>
</html>
