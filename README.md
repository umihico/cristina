# Cristina

## pre-requirements

```bash
aws route53 create-hosted-zone --name ${DEV_DOMAIN} --caller-reference `date +%Y-%m-%d_%H-%M-%S`
aws route53 create-hosted-zone --name ${PROD_DOMAIN} --caller-reference `date +%Y-%m-%d_%H-%M-%S`
```
