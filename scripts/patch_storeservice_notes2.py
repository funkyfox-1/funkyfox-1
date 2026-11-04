with open('src/admin/services/storeService.ts', 'r', encoding='utf-8') as f:
    text = f.read()

target = """    if (cloudResult?.tax !== undefined) {
      newOrder.tax = cloudResult.tax;
    }
    } else {
      newOrder.notes = '[LOCAL DEMO] Verified order created in local development mode';
      newOrder.internalNotes = ['[LOCAL DEMO] Verified order created in local development mode'];
    }"""

replace = """    if (cloudResult?.tax !== undefined) {
      newOrder.tax = cloudResult.tax;
    }
      newOrder.notes = '[SUPABASE CLOUD] Verified atomic PostgreSQL transaction';
      newOrder.internalNotes = ['[SUPABASE CLOUD] Persisted via RPC create_customer_order'];
    } else {
      newOrder.notes = '[LOCAL DEMO] Verified order created in local development mode';
      newOrder.internalNotes = ['[LOCAL DEMO] Verified order created in local development mode'];
    }"""

text = text.replace(target, replace, 1)

with open('src/admin/services/storeService.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated storeService.ts notes for both cloud and local demo modes!")

