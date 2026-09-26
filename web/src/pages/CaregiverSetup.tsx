import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TaskBadges, taskWhen } from '@/components/TaskBits'
import { createCircle, postTasks } from '@/data/actions'
import { DAYS, type Day, type RestWindow } from '@/data/models'
import { HERO_CIRCLE_ID } from '@/data/seed'
import { updateCurrentUser } from '@/data/session'
import { describeWindow, toMinutes } from '@/logic/grid'
import {
  DEMO_BACKLOG,
  DEMO_REST_WINDOW,
  splitTasks,
  type SplitTask,
} from '@/logic/splitTasks'

interface ReviewTask extends SplitTask {
  include: boolean
}

export default function CaregiverSetup() {
  const navigate = useNavigate()
  const [alias, setAlias] = useState('')
  const [day, setDay] = useState<Day>('Sat')
  const [start, setStart] = useState('13:00')
  const [end, setEnd] = useState('16:00')
  const [backlog, setBacklog] = useState('')
  const [planning, setPlanning] = useState(false)
  const [posting, setPosting] = useState(false)
  const [review, setReview] = useState<ReviewTask[] | null>(null)
  const [error, setError] = useState('')

  const restWindow: RestWindow = { day, start, end }

  function loadExample() {
    setAlias('Sunflower II')
    setDay(DEMO_REST_WINDOW.day)
    setStart(DEMO_REST_WINDOW.start)
    setEnd(DEMO_REST_WINDOW.end)
    setBacklog(DEMO_BACKLOG)
  }

  async function plan() {
    setError('')
    if (!alias.trim()) return setError('Add an alias (no real names).')
    if (toMinutes(end) - toMinutes(start) < 60)
      return setError('Your rest window needs to be at least an hour long.')
    if (!backlog.trim()) return setError('Type or paste what is on your plate this week.')
    setPlanning(true)
    const tasks = await splitTasks(backlog, restWindow)
    setReview(tasks.map((t) => ({ ...t, include: true })))
    setPlanning(false)
  }

  async function approve() {
    if (!review) return
    setPosting(true)
    const circle = await createCircle({
      alias: alias.trim(),
      rest_window: restWindow,
      backlog,
    })
    await postTasks(
      circle.id,
      review.filter((t) => t.include).map(({ include: _include, ...t }) => t),
    )
    await updateCurrentUser({ alias: alias.trim(), circle_id: circle.id })
    navigate(`/grid/${circle.id}`)
  }

  async function openDemoCircle() {
    await updateCurrentUser({ alias: 'Sunflower', circle_id: HERO_CIRCLE_ID })
    navigate(`/grid/${HERO_CIRCLE_ID}`)
  }

  if (review) {
    const included = review.filter((t) => t.include)
    const blocking = included.filter((t) => t.blocks_window).length
    const familyOnly = included.filter((t) => !t.volunteer_eligible).length
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Review your plan</h1>
          <p className="mt-1 text-lg text-muted-foreground">
            Nothing is posted until you approve. Remove anything that is wrong, or fix a title.
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-wrap gap-x-8 gap-y-2 pt-6 text-lg">
            <span><strong>{included.length}</strong> tasks</span>
            <span><strong>{blocking}</strong> land in {describeWindow(restWindow)}</span>
            <span><strong>{familyOnly}</strong> family only (hands-on or in the home)</span>
          </CardContent>
        </Card>

        <ul className="space-y-3">
          {review.map((t, i) => (
            <li key={i}>
              <Card className={t.include ? '' : 'opacity-50'}>
                <CardContent className="space-y-2 pt-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Input
                      aria-label={`Title for task ${i + 1}`}
                      className="min-w-0 flex-1 text-lg"
                      value={t.title}
                      onChange={(e) =>
                        setReview(review.map((r, j) => (j === i ? { ...r, title: e.target.value } : r)))
                      }
                    />
                    <Button
                      variant={t.include ? 'outline' : 'default'}
                      onClick={() =>
                        setReview(review.map((r, j) => (j === i ? { ...r, include: !r.include } : r)))
                      }
                    >
                      {t.include ? 'Remove' : 'Add back'}
                    </Button>
                  </div>
                  <p className="text-base text-muted-foreground">
                    {taskWhen(t)} · {t.duration} min
                  </p>
                  <TaskBadges task={t} />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3">
          <Button size="lg" className="text-lg" disabled={posting || included.length === 0} onClick={approve}>
            {posting ? 'Posting...' : `Approve and post ${included.length} tasks`}
          </Button>
          <Button size="lg" variant="outline" className="text-lg" onClick={() => setReview(null)}>
            Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Plan my rest</h1>
        <p className="mt-1 text-lg text-muted-foreground">
          Pick one window you want back this week, then tell us what is on your plate.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Your circle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="alias" className="text-base">Alias (please do not use a real name)</Label>
            <Input id="alias" className="max-w-sm text-lg" value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="e.g. Sunflower" />
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="day" className="text-base">Rest day</Label>
              <select
                id="day"
                value={day}
                onChange={(e) => setDay(e.target.value as Day)}
                className="h-10 rounded-md border border-input bg-card px-3 text-lg"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start" className="text-base">From</Label>
              <Input id="start" type="time" step={1800} className="text-lg" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end" className="text-base">Until</Label>
              <Input id="end" type="time" step={1800} className="text-lg" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backlog" className="text-base">What is on your plate this week?</Label>
            <Textarea
              id="backlog"
              rows={8}
              className="text-lg"
              value={backlog}
              onChange={(e) => setBacklog(e.target.value)}
              placeholder="One thing per line, in plain words: pick up a prescription, call the insurance company, cook dinners..."
            />
            <p className="text-sm text-muted-foreground">
              Please keep out health details. Hands-on care is always kept for family.
            </p>
          </div>

          {error && <p role="alert" className="text-lg font-semibold text-destructive">{error}</p>}

          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="text-lg" disabled={planning} onClick={plan}>
              {planning ? 'Planning...' : 'Plan my rest'}
            </Button>
            <Button size="lg" variant="outline" className="text-lg" onClick={loadExample}>
              Use the example
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <p className="text-lg">Demo: open the already-set-up Sunflower circle.</p>
          <Button variant="outline" size="lg" className="text-lg" onClick={openDemoCircle}>
            Open Sunflower
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
