// Configuration AdMob
// En mode développement (__DEV__), on utilise les IDs de test
// En production, on utilise vos vrais IDs

const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';

const PROD_BANNER_ID = 'ca-app-pub-8164267941739401/1117627812';
const PROD_INTERSTITIAL_ID = 'ca-app-pub-8164267941739401/6245454112';

export const BANNER_AD_UNIT_ID = __DEV__ ? TEST_BANNER_ID : PROD_BANNER_ID;
export const INTERSTITIAL_AD_UNIT_ID = __DEV__ ? TEST_INTERSTITIAL_ID : PROD_INTERSTITIAL_ID;
