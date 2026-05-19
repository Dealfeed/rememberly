import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const now = new Date().toISOString()

  const { data: messages, error } = await supabase
    .from('future_messages')
    .select('*')
    .eq('delivered', false)
    .lte('deliver_at', now)

  if (error) {
    return new Response(error.message)
  }

  for (const message of messages) {
    await resend.emails.send({
      from: 'Rememberly <onboarding@resend.dev>',
      to: message.recipient_email,
      subject: `A message from Rememberly 💌`,
      html: `
        <div style="font-family:sans-serif;padding:24px;">
          <h2>A future message arrived 💌</h2>
          <p>${message.message}</p>
        </div>
      `,
    })

    await supabase
      .from('future_messages')
      .update({ delivered: true })
      .eq('id', message.id)
  }

  return new Response('Messages processed')
})