import '../sass/style.scss'

import { $, $$ } from './modules/bling'
import autocomplete from './modules/autocomplete'

//$ instead of document.querySelector
autocomplete($('#address'), $('#lat'), $('#lng'))
