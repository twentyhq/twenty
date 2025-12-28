// most message types are supported except for unsupported as they don't have any customer data
// reference: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/text#text-message

export type WhatsAppWebhookMessage = {
  object: 'whatsapp_business_account';
  entry: Array<{
    id: string;
    changes: Array<WhatsappWebhookMessageChanges>;
  }>;
};

export type WhatsappWebhookMessageChanges = {
  value: {
    messaging_product: 'whatsapp';
    metadata: {
      display_phone_number: string;
      phone_number_id: string;
    };
    errors?: Array<{
      //reference: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/errors
      code: number;
      title: string;
      message: string;
      error_data: {
        details: string;
      };
      href: string;
    }>;
    contacts?: Array<{
      profile: {
        name: string;
      };
      wa_id: string;
      identity_key_hash?: string; // audio/button/document message
    }>;
    messages?: Array<WhatsappWebhookMessageContent>;
    statuses?: Array<{
      id: string;
      status: 'sent' | 'delivered' | 'read' | 'failed';
      timestamp: string;
      recipient_id: string;
    }>;
  };
  field: 'messages';
};

export type WhatsappWebhookMessageContent = {
  from: string; // Phone number
  group_id?: string; // only for group messages
  id: string; // WhatsApp message ID
  timestamp: string;
  type:
    | 'audio'
    | 'button'
    | 'contacts'
    | 'document'
    | 'image'
    | 'interactive'
    | 'location'
    | 'order'
    | 'reaction'
    | 'sticker'
    | 'system'
    | 'text'
    | 'unsupported'
    | 'video';
  audio?: {
    mime_type: string;
    sha256: string;
    id: string;
    url: string;
    voice: boolean;
  };
  button?: {
    payload: string;
    text: string;
  };
  context?: {
    // button message
    from: string;
    id: string;
  };
  contacts?: Array<{
    // many properties are optional => https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/contacts#syntax
    addresses?: Array<{
      city?: string;
      country?: string;
      country_code?: string;
      state?: string;
      street?: string;
      type?: string;
      zip?: string;
    }>;
    birthday?: string;
    emails?: Array<{
      email?: string;
      type?: string;
    }>;
    name?: {
      formatted_name?: string;
      first_name?: string;
      last_name?: string;
      middle_name?: string;
      suffix?: string;
      prefix?: string;
    };
    org: {
      company?: string;
      department?: string;
      title?: string;
    };
    phones?: Array<{
      phone?: string;
      wa_id?: string;
      type?: string;
    }>;
    urls?: Array<{
      url?: string;
      type?: string;
    }>;
  }>;
  document?: {
    caption: string;
    filename: string;
    mime_type: string;
    sha256: string;
    id: string;
    url: string;
  };
  image?: {
    caption: string;
    mime_type: string;
    sha256: string;
    id: string;
    url: string;
  };
  interactive?: {
    type: 'list_reply' | 'button_reply';
    list_reply?: {
      id: string;
      title: string;
      description: string;
    };
    button_reply?: {
      id: string;
      title: string;
    };
  };
  location?: {
    address: string;
    latitude: number;
    longitude: number;
    name: string;
    url: string;
  };
  order?: {
    catalog_id: string;
    text: string;
    product_items: Array<{
      product_retailer_id: string;
      quantity: number;
      item_price: number;
      currency: string;
    }>;
  };
  reaction?: {
    message_id: string;
    emoji?: string; // unicode
  };
  referral?: {
    // included if message was sent via ad https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/audio#syntax
    source_url: string;
    source_id: string;
    source_type: 'ad';
    body: string;
    headline: string;
    media_type: string;
    image_url: string;
    video_url: string;
    thumbnail_url: string;
    ctwa_clid: string;
    welcome_message: {
      text: string;
    };
  };
  sticker?: {
    mime_type: string;
    sha256: string;
    id: string;
    url: string;
    animated: boolean;
  };
  system?: {
    body: string;
    wa_id: string;
    type: 'user_changed_number';
  };
  text?: {
    body: string;
  };
  video?: {
    caption: string;
    mime_type: string;
    sha256: string;
    id: string;
    url: string;
  };
};
