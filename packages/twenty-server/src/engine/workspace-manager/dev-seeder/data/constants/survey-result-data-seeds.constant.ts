type SurveyResultDataSeed = {
  id: string;
  name: string;
  score: number;
  percentageOfCompletion: number;
  participants: number;
  averageEstimatedNumberOfAtomsInTheUniverse: string;
  comments: string;
  shortNotes: string;
};

export const SURVEY_RESULT_DATA_SEED_COLUMNS: (keyof SurveyResultDataSeed)[] = [
  'id',
  'name',
  'score',
  'percentageOfCompletion',
  'participants',
  'averageEstimatedNumberOfAtomsInTheUniverse',
  'comments',
  'shortNotes',
];

export const SURVEY_RESULT_DATA_SEED_IDS = {
  ID_1: '20202020-3d5f-4e2a-9c1b-7f8e2d3c4b5a',
  ID_2: '20202020-4e83-41ec-93e2-fd70ff09f68c',
  ID_3: '20202020-e716-4dd5-ac61-3315bc559e2d',
};

export const SURVEY_RESULT_DATA_SEEDS: SurveyResultDataSeed[] = [
  {
    id: SURVEY_RESULT_DATA_SEED_IDS.ID_1,
    name: 'First survey results - 2021',
    score: 0.26022134837694466,
    percentageOfCompletion: 76.3561814092,
    participants: 599,
    averageEstimatedNumberOfAtomsInTheUniverse:
      '78667671999742413888718514892176090137414339407788865817757694662213423853',
    comments:
      'Fuga agnosco patria volva aqua angustus utpote acquiro bestia. Abduco vorax volva agnosco alioqui. Cupiditas abbas aptus uterque bibo sonitus. Tergum carpo degero defaeco. Nostrum verumtamen tactus arbustum tui administratio. Terra sollers calculus blandior. Trans supra tricesimus. Utrum tenus comis adeo asporto sto quibusdam theologus suppono. Cursim casso alveus validus vapulus acer vis. Velum traho adipisci coerceo terminatio at allatus turbo adnuo blandior. Ante consectetur cedo cibo perferendis at amicitia degenero. Doloremque votum cupressus cerno stillicidium arcesso abundans antea sumo. Spoliatio asper solus. Vespillo distinctio ver truculenter torqueo vado aureus. Eaque bonus occaecati defungo defetiscor cibo. Thema ager usus verbum caute tergeo earum adipiscor vinculum. Delinquo tardus canonicus abbas amo confugo doloremque. Comburo quos cumque inflammatio dignissimos abstergo ventus cruentus. Tabula aliquid contego sono delectatio aeternus. Summopere crinis debitis stella conservo desipio termes vulgaris.',
    shortNotes: 'verto ascit iure tribuo vulnero',
  },
  {
    id: SURVEY_RESULT_DATA_SEED_IDS.ID_2,
    name: 'With only people from the US',
    score: 0.07128839939832687,
    percentageOfCompletion: 61.6284981836,
    participants: 575,
    averageEstimatedNumberOfAtomsInTheUniverse:
      '58714201303231867082632874445965836504227665636297405101762256297406500076',
    comments:
      'Benevolentia valens caecus triduana. Cerno curiositas amita. Urbs urbs tertius iure spes succedo aspernatur culpa caute commodo. Cohaero voluptas amplexus denuo caelestis deprimo cresco cognatus aranea. Tabula perferendis ullus taedium vulnero stella corrupti testimonium. Ventosus ars abundans coniuratio. Cohibeo turba apostolus cunae tutamen. Audacia quod benevolentia charisma. Beatus consequuntur uterque crustulum valetudo spes vicinus. Tardus curso crinis ambulo cupiditate cras ad basium volup. Trepide dapifer theologus volva. Urbanus audacia ver aeger clamo animus adsidue error thorax. Ut centum volutabrum virgo summisse earum. Campana bos adulatio candidus tabgo tempore caries coadunatio. Cenaculum absque sustineo angustus quisquam auctus laudantium carbo stella. Conservo thymbra asperiores coaegresco vergo. Cubicularis canis solio. Tener vestrum iure claustrum velum aperte crinis ascisco clarus clam. Vinco ademptio absum. Verto desolo depraedor error coadunatio.',
    shortNotes: 'tres tantillus vado aequus ago',
  },
  {
    id: SURVEY_RESULT_DATA_SEED_IDS.ID_3,
    name: 'People who like cats',
    score: 0.1480973360594362,
    percentageOfCompletion: 72.4289541366,
    participants: 590,
    averageEstimatedNumberOfAtomsInTheUniverse:
      '51790645279092482632713239096036038617511762830423654232543291815995800207',
    comments:
      'Omnis careo ait praesentium inventore amet stips versus. Charisma demens vergo ex tibi desolo harum valens urbs abeo. Subnecto tantum tenax. Esse aduro caste comprehendo color bellicus excepturi tego coniuratio stella. Cogo cognatus cogo acerbitas aro. Asper cohibeo tam venustas arma antea studio eveniet casus. Numquam benevolentia voco celer. Defungo arcesso viridis veritas adsuesco desparatus patria tondeo canonicus stillicidium. Clamo truculenter vix allatus succedo depereo aestivus praesentium. Spiritus comes adipisci. Atrocitas virtus alveus strenuus. Repellat thermae aptus placeat aut. Ambitus tunc convoco adulatio averto. Agnitio aegrotatio aequus decumbo conventus. Valens adulatio ad voluptatibus conspergo vallum tredecim correptius. Celo aranea umquam. A abscido vigor virtus tristis cavus. Truculenter natus bonus sollers vulgivagus amita. Occaecati illo voco terga carcer commodo. Succurro vociferor bene vere accusamus defluo at videlicet aranea deleniti.',
    shortNotes: 'aeneus armarium conventus curto rerum',
  },
];
