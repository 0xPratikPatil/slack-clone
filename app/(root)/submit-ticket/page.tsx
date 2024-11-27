import React from 'react'
import SubmitTicketPage from '@/components/settings/submit-ticket-page'
import { getSession } from '@/components/auth/get-session'
import { redirect } from 'next/navigation'


const SubmitTicket = async () => {
    const session = await getSession()
    if (!session) redirect("/login")
    return <SubmitTicketPage session={session} />
}

export default SubmitTicket