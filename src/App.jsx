export default function RememberlyApp() {
  const reminders = [
    {
      id: 1,
      title: 'Team Meeting',
      time: '09:00 AM',
      description: 'Weekly product sync with the design team.',
      completed: false,
    },
    {
      id: 2,
      title: 'Pay Electricity Bill',
      time: '06:00 PM',
      description: 'Monthly utility payment reminder.',
      completed: true,
    },
    {
      id: 3,
      title: 'Call Mum',
      time: '08:30 PM',
      description: 'Catch up and check in.',
      completed: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-lg md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Rememberly</h1>
            <p className="mt-2 text-slate-600">
              Smart reminders, tasks, and daily planning in one place.
            </p>
          </div>

          <button className="rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:scale-105">
            + Create Reminder
          </button>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-md">
            <p className="text-sm text-slate-500">Active Reminders</p>
            <h2 className="mt-2 text-4xl font-bold">12</h2>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-md">
            <p className="text-sm text-slate-500">Completed Today</p>
            <h2 className="mt-2 text-4xl font-bold">7</h2>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-md">
            <p className="text-sm text-slate-500">Upcoming Events</p>
            <h2 className="mt-2 text-4xl font-bold">4</h2>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">
              Today’s Reminders
            </h2>

            <input
              type="text"
              placeholder="Search reminders..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-black md:w-72"
            />
          </div>

          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 transition hover:shadow-md md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {reminder.title}
                    </h3>

                    {reminder.completed ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        Completed
                      </span>
                    ) : (
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                        Pending
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-slate-600">
                    {reminder.description}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                    {reminder.time}
                  </div>

                  <button className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-100">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-xl">
          <h2 className="text-2xl font-bold">AI Reminder Assistant</h2>
          <p className="mt-2 max-w-2xl text-slate-200">
            Automatically schedule reminders from messages, emails, and voice notes.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <button className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-105">
              Enable AI Features
            </button>

            <button className="rounded-2xl border border-white/30 px-6 py-3 text-sm font-semibold transition hover:bg-white/10">
              Connect Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}